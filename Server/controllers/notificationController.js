const Notification = require("../models/notification");

async function list(req, res, next) {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate("ticket", "ticketNumber title status")
      .sort({ createdAt: -1 })
      .limit(100);
    const unread = notifications.filter((n) => !n.read).length;
    res.json({ notifications, unread });
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.userId },
      { read: true },
      { returnDocument: "after" }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ notification });
  } catch (error) {
    next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, markRead, markAllRead };
