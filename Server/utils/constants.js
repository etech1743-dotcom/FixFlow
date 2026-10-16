const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Carpentry",
  "Painting",
  "Appliance",
  "Cleaning",
  "General",
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const STATUSES = [
  "Open",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Reopened",
  "Cancelled",
  "On Hold",
];

const DAILY_ACCEPTANCE_LIMIT = 5;
const MATCH_RADIUS_METERS = 50000;

const SLA_HOURS = {
  Urgent: { assign: 2, resolve: 12 },
  High: { assign: 4, resolve: 24 },
  Medium: { assign: 8, resolve: 48 },
  Low: { assign: 24, resolve: 72 },
};

function normalizeCategory(value = "") {
  const raw = String(value).trim();
  const match = CATEGORIES.find(
    (item) => item.toLowerCase() === raw.toLowerCase()
  );
  return match || raw;
}

function safeUser(user) {
  if (!user) return null;
  const doc = user.toObject ? user.toObject() : user;
  delete doc.password;
  delete doc.resetPasswordToken;
  delete doc.resetPasswordExpires;
  return doc;
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function slaDeadlines(priority, from = new Date()) {
  const hours = SLA_HOURS[priority] || SLA_HOURS.Medium;
  return {
    slaAssignBy: new Date(from.getTime() + hours.assign * 60 * 60 * 1000),
    slaResolveBy: new Date(from.getTime() + hours.resolve * 60 * 60 * 1000),
  };
}

module.exports = {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  DAILY_ACCEPTANCE_LIMIT,
  MATCH_RADIUS_METERS,
  SLA_HOURS,
  normalizeCategory,
  safeUser,
  todayKey,
  slaDeadlines,
};
