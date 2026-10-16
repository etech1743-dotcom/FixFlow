const Ticket = require("../models/ticket");
const Activity = require("../models/activity");
const Review = require("../models/review");
const {
  acceptTicketAtomically,
  getTodayCount,
  workerMatchesCategory,
  nearbyFilter,
} = require("../services/assignmentService");
const { notify, emitToUser } = require("../services/notificationService");
const { DAILY_ACCEPTANCE_LIMIT } = require("../utils/constants");

function fileMeta(req, files) {
  return (files || []).map((file) => ({
    url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    filename: file.originalname,
    mimeType: file.mimetype,
  }));
}

async function availableTickets(req, res, next) {
  try {
    const worker = req.authUser;

    if (
      !worker ||
      worker.role !== "worker" ||
      !worker.isActive ||
      !worker.isApproved
    ) {
      return res.status(403).json({
        message: "Your worker account is not eligible to explore tickets",
      });
    }

    const category = worker.category;
    const skills = worker.skills || [];

    const matchValues = [
      ...new Set(
        [category, ...skills]
          .filter(Boolean)
          .map((value) => value.trim())
      ),
    ];

    if (!matchValues.length) {
      return res.json({ tickets: [] });
    }

    const geo = nearbyFilter(worker);

    const filter = {
      status: { $in: ["Open", "Reopened"] },
      assignedWorker: null,
      ignoredBy: { $ne: worker._id },
      category: { $in: matchValues },
      ...geo,
    };

    const tickets = await Ticket.find(filter)
      .populate("createdBy", "name address")
      .sort({ priority: -1, createdAt: -1 })
      .limit(50);

    return res.json({ tickets });
  } catch (error) {
    next(error);
  }
}

async function acceptTicket(req, res, next) {
  try {
    const ticket = await acceptTicketAtomically(req.params.id, req.authUser);
    await Activity.create({
      ticket: ticket._id,
      actor: req.user.userId,
      action: "accepted",
      fromStatus: "Open",
      toStatus: "Assigned",
    });

    await notify(req, {
      recipient: ticket.createdBy,
      ticket: ticket._id,
      type: "ticket:assigned",
      message: `${req.authUser.name} accepted ${ticket.ticketNumber}`,
    });

    emitToUser(req, ticket.createdBy.toString(), "ticket:assigned", ticket);
    emitToUser(req, req.user.userId, "ticket:assigned", ticket);

    const populated = await Ticket.findById(ticket._id)
      .populate("createdBy", "name phone address")
      .populate("assignedWorker", "name category");

    res.json({ message: "Ticket accepted", ticket: populated });
  } catch (error) {
    next(error);
  }
}

async function ignoreTicket(req, res, next) {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { ignoredBy: req.user.userId } },
      { returnDocument: "after" }
    );
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json({ message: "Ticket dismissed for you", ticket });
  } catch (error) {
    next(error);
  }
}

async function myJobs(req, res, next) {
  try {
    const tickets = await Ticket.find({ assignedWorker: req.user.userId })
      .populate("createdBy", "name phone address")
      .sort({ updatedAt: -1 });
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
}

async function startJob(req, res, next) {
  try {
    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedWorker: req.user.userId,
        status: "Assigned",
      },
      { $set: { status: "In Progress", startedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!ticket) {
      return res.status(409).json({ message: "Job cannot be started in its current state" });
    }
    await Activity.create({
      ticket: ticket._id,
      actor: req.user.userId,
      action: "started",
      fromStatus: "Assigned",
      toStatus: "In Progress",
    });
    await notify(req, {
      recipient: ticket.createdBy,
      ticket: ticket._id,
      type: "ticket:status-updated",
      message: `Work started on ${ticket.ticketNumber}`,
    });
    res.json({ message: "Job started", ticket });
  } catch (error) {
    next(error);
  }
}

async function addWorkNotes(req, res, next) {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      assignedWorker: req.user.userId,
    });
    if (!ticket) return res.status(404).json({ message: "Job not found" });
    ticket.resolutionNotes = req.body.notes || ticket.resolutionNotes;
    await ticket.save();
    await Activity.create({
      ticket: ticket._id,
      actor: req.user.userId,
      action: "notes-updated",
      metadata: { notes: req.body.notes },
    });
    res.json({ message: "Notes saved", ticket });
  } catch (error) {
    next(error);
  }
}

async function resolveJob(req, res, next) {
  try {
    const notes = req.body.resolutionNotes || req.body.notes;
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      assignedWorker: req.user.userId,
      status: { $in: ["Assigned", "In Progress"] },
    });
    if (!ticket) {
      return res.status(409).json({ message: "You can only resolve your active jobs" });
    }
    if (!notes?.trim()) {
      return res.status(400).json({ message: "Resolution notes are required" });
    }

    const fromStatus = ticket.status;
    ticket.status = "Resolved";
    ticket.resolvedAt = new Date();
    ticket.resolutionNotes = notes.trim();
    if (req.files?.length) {
      ticket.completionEvidence = [
        ...(ticket.completionEvidence || []),
        ...fileMeta(req, req.files),
      ];
    }
    ticket.isOverdue = ticket.slaResolveBy ? ticket.resolvedAt > ticket.slaResolveBy : false;
    await ticket.save();

    await Activity.create({
      ticket: ticket._id,
      actor: req.user.userId,
      action: "resolved",
      fromStatus,
      toStatus: "Resolved",
    });

    await notify(req, {
      recipient: ticket.createdBy,
      ticket: ticket._id,
      type: "ticket:resolved",
      message: `${ticket.ticketNumber} has been marked resolved. Please confirm the repair.`,
    });

    emitToUser(req, ticket.createdBy.toString(), "ticket:resolved", ticket);
    res.json({ message: "Job resolved", ticket });
  } catch (error) {
    next(error);
  }
}

async function myStats(req, res, next) {
  try {
    const workerId = req.user.userId;
    const jobs = await Ticket.find({ assignedWorker: workerId });
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const assigned = jobs.filter((j) => ["Assigned", "In Progress"].includes(j.status)).length;
    const inProgress = jobs.filter((j) => j.status === "In Progress").length;
    const resolvedToday = jobs.filter(
      (j) => j.resolvedAt && j.resolvedAt >= start
    ).length;
    const reviews = await Review.find({ worker: workerId });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      assigned,
      inProgress,
      resolvedToday,
      completed: jobs.filter((j) => ["Resolved", "Closed"].includes(j.status)).length,
      avgRating: Number(avgRating.toFixed(1)),
      reviewCount: reviews.length,
    });
  } catch (error) {
    next(error);
  }
}

async function myAcceptanceLimit(req, res, next) {
  try {
    const used = await getTodayCount(req.user.userId);
    const limit = req.authUser.dailyLimit || DAILY_ACCEPTANCE_LIMIT;
    res.json({ used, limit, remaining: Math.max(limit - used, 0) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  availableTickets,
  acceptTicket,
  ignoreTicket,
  myJobs,
  startJob,
  addWorkNotes,
  resolveJob,
  myStats,
  myAcceptanceLimit,
  workerMatchesCategory,
};
