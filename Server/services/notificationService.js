const Notification = require("../models/notification");

function emitToUser(req, userId, event, payload) {
  const io = req.app.get("io");
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}

async function notify(req, { recipient, ticket, type, message }) {
  const notification = await Notification.create({
    recipient,
    ticket,
    type,
    message,
  });
  emitToUser(req, recipient.toString(), "notification:new", notification);
  return notification;
}

module.exports = { notify, emitToUser };
