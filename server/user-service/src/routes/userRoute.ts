const userController = require("../controllers/userController");
const session = require("../middlewares/Session");

const router = require("express").Router();

router.post("/auth/google", userController.googleUser, session.createSession);

router.post("/auth/facebook", userController.facebookUser, session.createSession); 

router.post("/info/set", session.checkAndRecreateSession, userController.setUserInfo);

router.get("/info/get", session.checkAndRecreateSession, userController.getUserInfo);

module.exports = router;