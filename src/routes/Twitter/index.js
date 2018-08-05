import { Router } from "express";
import Twitter from "./controller";

const router = Router();

router.get("/token", async function(req, res, next) {
  try {
    const r = await Twitter.token();
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.post("/invalidate_token", async function(req, res, next) {
  try {
    const r = await Twitter.invalidateToken({ ...req.body });
    res.status(200).json({
      message: "Twitter 'access_token' successfully invalidated.",
      invalidated_token: r.data.access_token
    });
  } catch (error) {
    next(error);
  }
});

router.get("/timeline", async function(req, res, next) {
  try {
    const r = await Twitter.timeline({ ...req.headers, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/likes", async function(req, res, next) {
  try {
    const r = await Twitter.likes({ ...req.headers, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
