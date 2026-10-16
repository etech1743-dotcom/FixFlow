const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/user");
const Ticket = require("./models/ticket");
const Activity = require("./models/activity");
const { slaDeadlines } = require("./utils/constants");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const password = await bcrypt.hash("123456", 10);

  const upsert = async (email, data) => {
    return User.findOneAndUpdate(
      { email },
      { ...data, email, password },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  };

  const admin = await upsert("admin@fixflow.com", {
    name: "FixFlow Admin",
    role: "admin",
    phone: "9990001111",
    address: "FixFlow HQ",
  });

  const user = await upsert("user@fixflow.com", {
    name: "Aarav Mehta",
    role: "user",
    phone: "9876501234",
    address: "Building A, Floor 2, Room 204",
    location: { type: "Point", coordinates: [77.209, 28.6139] },
  });

  const plumber = await upsert("plumber@fixflow.com", {
    name: "Rahul Sharma",
    role: "worker",
    phone: "9811112233",
    address: "Delhi",
    serviceArea: "Delhi",
    category: "Plumbing",
    skills: ["Plumbing", "General"],
    isApproved: true,
    location: { type: "Point", coordinates: [77.21, 28.62] },
  });

  const electrician = await upsert("electrician@fixflow.com", {
    name: "Neha Verma",
    role: "worker",
    phone: "9822223344",
    address: "Delhi",
    serviceArea: "Delhi",
    category: "Electrical",
    skills: ["Electrical", "Appliance"],
    isApproved: true,
    location: { type: "Point", coordinates: [77.2, 28.61] },
  });

  await Ticket.deleteMany({ ticketNumber: { $in: ["FF1001", "FF1002", "FF1003"] } });

  const samples = [
    {
      ticketNumber: "FF1001",
      createdBy: user._id,
      title: "Leaking bathroom tap",
      description: "Water keeps leaking when the tap is closed.",
      category: "Plumbing",
      priority: "High",
      status: "Open",
      location: {
        address: "Building A, Floor 2, Room 204",
        geo: { type: "Point", coordinates: [77.209, 28.6139] },
      },
      ...slaDeadlines("High"),
    },
    {
      ticketNumber: "FF1002",
      createdBy: user._id,
      title: "Corridor lights flickering",
      description: "Lights in the east corridor flicker every few minutes.",
      category: "Electrical",
      priority: "Medium",
      status: "Open",
      location: {
        address: "Building A, Lobby",
        geo: { type: "Point", coordinates: [77.208, 28.614] },
      },
      ...slaDeadlines("Medium"),
    },
    {
      ticketNumber: "FF1003",
      createdBy: user._id,
      title: "AC not cooling",
      description: "Bedroom AC runs but does not cool the room.",
      category: "HVAC",
      priority: "Urgent",
      status: "Open",
      location: {
        address: "Block A, Room 302",
        geo: { type: "Point", coordinates: [77.21, 28.615] },
      },
      ...slaDeadlines("Urgent"),
    },
  ];

  for (const sample of samples) {
    const ticket = await Ticket.create(sample);
    await Activity.create({
      ticket: ticket._id,
      actor: user._id,
      action: "created",
      toStatus: "Open",
    });
  }

  console.log("Seed complete. Demo logins (password: 123456):");
  console.log("  admin@fixflow.com");
  console.log("  user@fixflow.com");
  console.log("  plumber@fixflow.com");
  console.log("  electrician@fixflow.com");
  console.log({ admin: admin.email, user: user.email, plumber: plumber.email, electrician: electrician.email });

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
