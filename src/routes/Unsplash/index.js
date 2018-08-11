import { Router } from "express";
import Unsplash from "./controller";

const router = Router();

router.get("/profile", async function(req, res, next) {
  try {
    const r = await Unsplash.profile({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/photos", async function(req, res, next) {
  try {
    const r = await Unsplash.photos({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/likes", async function(req, res, next) {
  try {
    const r = await Unsplash.likes({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/collections", async function(req, res, next) {
  try {
    const r = await Unsplash.collections({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/statistics", async function(req, res, next) {
  try {
    const r = await Unsplash.statistics({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

export default router;
