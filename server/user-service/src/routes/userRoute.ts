import express from "express";

import { facebookUser, googleUser, setUserInfo, getUserInfo, checkUser } from "../controllers/userController";
import createSession from "../middlewares/createSession";
import checkAndRecreateSessionMiddleware from "../middlewares/checkAndRecreateSessionMiddleware";

const router = express.Router();

router.post("/auth/google", googleUser, createSession);

router.post("/auth/facebook", facebookUser, createSession); 

router.get("/auth/check", checkUser);

router.post("/info/set", checkAndRecreateSessionMiddleware, setUserInfo);

router.get("/info/get", checkAndRecreateSessionMiddleware, getUserInfo);

export default router;