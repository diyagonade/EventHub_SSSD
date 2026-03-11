const { Router } = require("express");
const {
  listNotifications,
  markRead,
  markAllRead,
} = require("../controllers/notifications");
const auth = require("../middleware/auth");

const router = Router();

router.get("/", auth, listNotifications);
router.patch("/read-all", auth, markAllRead);
router.patch("/:id/read", auth, markRead);

module.exports = router;
