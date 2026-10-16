const Ticket = require("../models/ticket");
const DailyAcceptance = require("../models/dailyAcceptance");

const {
  DAILY_ACCEPTANCE_LIMIT,
  MATCH_RADIUS_METERS,
  todayKey,
  normalizeCategory,
} = require("../utils/constants");

// --------------------------------------------------
// Validate worker location
// --------------------------------------------------
function hasValidLocation(worker) {
  const location = worker?.location;

  if (location?.type !== "Point") {
    return false;
  }

  const coordinates = location.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }

  const [longitude, latitude] = coordinates;

  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    return false;
  }

  // FixFlow treats [0, 0] as an unset-location placeholder.
  if (longitude === 0 && latitude === 0) {
    return false;
  }

  return true;
}

// --------------------------------------------------
// Validate worker category and skills
// --------------------------------------------------
function workerMatchesCategory(worker, category) {
  const normalize = (value) =>
    normalizeCategory(value || "").trim().toLowerCase();

  const target = normalize(category);

  if (!target) {
    return false;
  }

  const primary = normalize(worker.category);

  const skills = (worker.skills || []).map(normalize);

  return primary === target || skills.includes(target);
}

// --------------------------------------------------
// Get today's accepted-ticket count
// --------------------------------------------------
async function getTodayCount(workerId) {
  const record = await DailyAcceptance.findOne({
    worker: workerId,
    date: todayKey(),
  });

  return record?.count || 0;
}

// --------------------------------------------------
// Reserve one daily acceptance slot
// --------------------------------------------------
async function reserveDailySlot(worker) {
  const date = todayKey();

  const limit =
    worker.dailyLimit ?? DAILY_ACCEPTANCE_LIMIT;

  if (!Number.isInteger(limit) || limit < 1) {
    const err = new Error("Invalid daily acceptance limit");
    err.status = 500;
    throw err;
  }

  // Increment an existing daily record if below the limit.
  const updated = await DailyAcceptance.findOneAndUpdate(
    {
      worker: worker._id,
      date,
      count: { $lt: limit },
    },
    {
      $inc: { count: 1 },
    },
    {
      new: true,
    }
  );

  if (updated) {
    return updated;
  }

  // Create the first daily record.
  try {
    return await DailyAcceptance.create({
      worker: worker._id,
      date,
      count: 1,
    });
  } catch (error) {
    // Another request may have created the same daily record.
    if (error.code !== 11000) {
      throw error;
    }

    const retry = await DailyAcceptance.findOneAndUpdate(
      {
        worker: worker._id,
        date,
        count: { $lt: limit },
      },
      {
        $inc: { count: 1 },
      },
      {
        new: true,
      }
    );

    if (!retry) {
      const err = new Error("Daily acceptance limit reached");
      err.status = 409;
      err.code = "DAILY_ACCEPTANCE_LIMIT_REACHED";
      throw err;
    }

    return retry;
  }
}

// --------------------------------------------------
// Release a reserved slot if ticket acceptance fails
// --------------------------------------------------
async function releaseDailySlot(workerId, date = todayKey()) {
  await DailyAcceptance.findOneAndUpdate(
    {
      worker: workerId,
      date,
      count: { $gt: 0 },
    },
    {
      $inc: { count: -1 },
    },
    {
      new: true,
    }
  );
}

// --------------------------------------------------
// Build the nearby-ticket filter
// --------------------------------------------------
function nearbyFilter(worker) {
  if (!hasValidLocation(worker)) {
    const err = new Error(
      "Please update your location before exploring tickets"
    );

    err.status = 400;
    err.code = "WORKER_LOCATION_REQUIRED";

    throw err;
  }

  return {
    "location.geo": {
      $near: {
        $geometry: worker.location,
        $maxDistance: MATCH_RADIUS_METERS,
      },
    },
  };
}

// --------------------------------------------------
// Accept a ticket with eligibility and location checks
// --------------------------------------------------
async function acceptTicketAtomically(ticketId, worker) {
  // 1. Verify worker eligibility.
  if (
    !worker.isActive ||
    !worker.isApproved ||
    worker.role !== "worker"
  ) {
    const err = new Error(
      "Worker account is not eligible to accept tickets"
    );

    err.status = 403;
    throw err;
  }

  // 2. Verify the worker has a usable location.
  if (!hasValidLocation(worker)) {
    const err = new Error(
      "Please update your location before accepting tickets"
    );

    err.status = 400;
    err.code = "WORKER_LOCATION_REQUIRED";

    throw err;
  }

  // 3. Find the ticket and validate its category.
  const openTicket = await Ticket.findById(ticketId);

  if (!openTicket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  if (!workerMatchesCategory(worker, openTicket.category)) {
    const err = new Error(
      "Ticket category does not match your skills"
    );

    err.status = 403;
    throw err;
  }

  // 4. Verify the ticket is inside the worker's service radius.
  const nearbyTicket = await Ticket.findOne({
    _id: ticketId,
    ...nearbyFilter(worker),
  }).select("_id");

  if (!nearbyTicket) {
    const err = new Error(
      "This ticket is outside your permitted service area"
    );

    err.status = 403;
    err.code = "TICKET_OUTSIDE_SERVICE_AREA";

    throw err;
  }

  // 5. Reserve the daily slot before claiming the ticket.
  const reservation = await reserveDailySlot(worker);

  try {
    // 6. Atomically claim the ticket.
    // Only one competing request can claim an eligible ticket.
    const claimed = await Ticket.findOneAndUpdate(
      {
        _id: ticketId,
        status: { $in: ["Open", "Reopened"] },
        assignedWorker: null,
      },
      {
        $set: {
          assignedWorker: worker._id,
          status: "Assigned",
          acceptedAt: new Date(),
        },
      },
      {
        new: true,
      }
    );

    if (!claimed) {
      const err = new Error(
        "Ticket already claimed or is not available"
      );

      err.status = 409;
      err.code = "TICKET_NOT_AVAILABLE";

      throw err;
    }

    return claimed;
  } catch (error) {
    // Release the exact day's reservation, including after midnight.
    try {
      await releaseDailySlot(worker._id, reservation.date);
    } catch (releaseError) {
      // Preserve the original acceptance error.
      console.error(
        "Failed to release daily acceptance slot:",
        releaseError
      );
    }

    throw error;
  }
}

module.exports = {
  workerMatchesCategory,
  getTodayCount,
  acceptTicketAtomically,
  nearbyFilter,
  hasValidLocation,
};
// const Ticket = require("../models/ticket");
// const DailyAcceptance = require("../models/dailyAcceptance");
// const {
//   DAILY_ACCEPTANCE_LIMIT,
//   MATCH_RADIUS_METERS,
//   todayKey,
//   normalizeCategory,
// } = require("../utils/constants");

// function workerMatchesCategory(worker, category) {
//   const target = normalizeCategory(category).toLowerCase();
//   const primary = (worker.category || "").toLowerCase();
//   const skills = (worker.skills || []).map((s) => s.toLowerCase());
//   return primary === target || skills.includes(target);
// }

// async function getTodayCount(workerId) {
//   const record = await DailyAcceptance.findOne({
//     worker: workerId,
//     date: todayKey(),
//   });
//   return record?.count || 0;
// }

// async function reserveDailySlot(worker) {
//   const date = todayKey();
//   const limit = worker.dailyLimit || DAILY_ACCEPTANCE_LIMIT;

//   const updated = await DailyAcceptance.findOneAndUpdate(
//     { worker: worker._id, date, count: { $lt: limit } },
//     { $inc: { count: 1 } },
//     { returnDocument: "after" }
//   );

//   if (updated) return updated;

//   try {
//     return await DailyAcceptance.create({
//       worker: worker._id,
//       date,
//       count: 1,
//     });
//   } catch (error) {
//     if (error.code !== 11000) throw error;
//     const retry = await DailyAcceptance.findOneAndUpdate(
//       { worker: worker._id, date, count: { $lt: limit } },
//       { $inc: { count: 1 } },
//       { returnDocument: "after" }
//     );
//     if (!retry) {
//       const err = new Error("Daily acceptance limit reached");
//       err.status = 409;
//       throw err;
//     }
//     return retry;
//   }
// }

// async function releaseDailySlot(workerId) {
//   await DailyAcceptance.findOneAndUpdate(
//     { worker: workerId, date: todayKey(), count: { $gt: 0 } },
//     { $inc: { count: -1 } }
//   );
// }

// async function acceptTicketAtomically(ticketId, worker) {
//   if (!worker.isActive || !worker.isApproved || worker.role !== "worker") {
//     const err = new Error("Worker account is not eligible to accept tickets");
//     err.status = 403;
//     throw err;
//   }

//   const openTicket = await Ticket.findById(ticketId);
//   if (!openTicket) {
//     const err = new Error("Ticket not found");
//     err.status = 404;
//     throw err;
//   }

//   if (!workerMatchesCategory(worker, openTicket.category)) {
//     const err = new Error("Ticket category does not match your skills");
//     err.status = 403;
//     throw err;
//   }

//   await reserveDailySlot(worker);

//   const claimed = await Ticket.findOneAndUpdate(
//     {
//       _id: ticketId,
//       status: { $in: ["Open", "Reopened"] },
//       assignedWorker: null,
//     },
//     {
//       $set: {
//         assignedWorker: worker._id,
//         status: "Assigned",
//         acceptedAt: new Date(),
//       },
//     },
//     { returnDocument: "after" }
//   );

//   if (!claimed) {
//     await releaseDailySlot(worker._id);
//     const err = new Error("Ticket already claimed or is not available");
//     err.status = 409;
//     throw err;
//   }

//   return claimed;
// }

// function nearbyFilter(worker) {
//   if (!worker.location?.coordinates?.length) return null;
//   return {
//     "location.geo": {
//       $near: {
//         $geometry: worker.location,
//         $maxDistance: MATCH_RADIUS_METERS,
//       },
//     },
//   };
// }

// module.exports = {
//   workerMatchesCategory,
//   getTodayCount,
//   acceptTicketAtomically,
//   nearbyFilter,
// };
