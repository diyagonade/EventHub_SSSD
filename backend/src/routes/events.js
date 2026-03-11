const { Router } = require("express");
const {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  myEvents,
} = require("../controllers/events");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const sseBroker = require("../lib/sseBroker");

const router = Router();

// SSE stream — authenticated clients subscribe here for live updates
router.get("/stream", auth, (req, res) => {
  sseBroker.addClient(res, req.user.id);
});

// Public
router.get("/", listEvents);
router.get("/my", auth, requireRole("ORGANIZER"), myEvents);
router.get("/:id", getEvent);

// Organizer only
router.post("/", auth, requireRole("ORGANIZER"), createEvent);
router.put("/:id", auth, requireRole("ORGANIZER"), updateEvent);
router.delete("/:id", auth, requireRole("ORGANIZER"), deleteEvent);

module.exports = router;
