const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  dashboard,
  listTickets,
  getTicketDetails,
  assignWorker,
  reassignWorker,
  updatePriority,
  updateTicketStatus,
  listUsers,
  getUserDetails,
  updateUserStatus,
  listWorkers,
  getWorkerDetails,
  updateWorkerStatus,
  reports,
} = require("../controllers/adminController");
const router = express.Router();
router.use(authenticateToken, authorizeRoles("admin"));

router.get("/dashboard", dashboard);
router.get("/tickets", listTickets);
router.get("/tickets/:id", getTicketDetails);
router.get("/users/:id", getUserDetails);
router.get("/workers/:id", getWorkerDetails);
router.patch("/tickets/:id/assign", assignWorker);
router.patch("/tickets/:id/reassign", reassignWorker);
router.patch("/tickets/:id/priority", updatePriority);
router.patch("/tickets/:id/status", updateTicketStatus);

router.get("/users", listUsers);
router.patch("/users/:id/status", updateUserStatus);
router.get("/workers", listWorkers);
router.patch("/workers/:id/status", updateWorkerStatus);
router.get("/reports", reports);
module.exports = router;
