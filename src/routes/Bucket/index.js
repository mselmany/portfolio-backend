import { Router } from "express";
import Bucket from "./controller";

const router = Router();

router.get("/bucket", async function(req, res, next) {
  try {
    const r = await Bucket.fetch({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

export default router;
