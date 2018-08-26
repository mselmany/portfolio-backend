import { Router } from "express";
import Bucket from "./controller";

const router = Router();

router.get("/list", async function(req, res, next) {
  try {
    const r = await Bucket.list({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/status", async function(req, res, next) {
  try {
    const r = await Bucket.status();
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

export default router;
