import { Router } from "express";
import Timeline from "./controller";

const router = Router();

router.get("/timeline", async function(req, res, next) {
  try {
    const r = await Timeline.fetch({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

export default router;
