const { Router } = require("express");
const {
  register,
  cancel,
  myRegistrations,
} = require("../controllers/registrations");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = Router();

router.get("/my", auth, myRegistrations);
router.post("/", auth, requireRole("USER"), register);
router.delete("/:eventId", auth, requireRole("USER"), cancel);

module.exports = router;
