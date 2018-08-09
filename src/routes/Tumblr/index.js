import { Router } from "express";
import Tumblr from "./controller";

const router = Router();

router.get("/bloginfo", async function(req, res, next) {
  try {
    const r = await Tumblr.bloginfo({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/likes", async function(req, res, next) {
  try {
    const r = await Tumblr.likes({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/posts", async function(req, res, next) {
  try {
    const r = await Tumblr.posts({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

export default router;
