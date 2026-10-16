const Ticket = require("../models/ticket");

async function generateTicketNumber() {
  const count = await Ticket.countDocuments();
  return `FF${String(1000 + count + 1)}`;
}

module.exports = { generateTicketNumber };
