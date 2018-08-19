import { Router } from "express";
import Twitter from "./controller";

const router = Router();

router.get("/token", async function(req, res, next) {
  try {
    const r = await Twitter.token();
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.post("/refresh_token", async function(req, res, next) {
  try {
    const r = await Twitter.refreshToken({ ...req.body });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/timeline", async function(req, res, next) {
  try {
    const r = await Twitter.timeline({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/likes", async function(req, res, next) {
  try {
    const r = await Twitter.likes({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

export default router;
