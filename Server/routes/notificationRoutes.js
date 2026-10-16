const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  list,
  markRead,
  markAllRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.use(authenticateToken);
router.get("/", list);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

module.exports = router;
