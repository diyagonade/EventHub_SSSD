const { Router } = require("express");
const { register, login, logout, me } = require("../controllers/auth");
const auth = require("../middleware/auth");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", auth, me);

module.exports = router;
