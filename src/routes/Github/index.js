import { Router } from "express";
import { events, stars, gists, watchers } from "./controller";

const router = Router();

router.get("/events", async function(req, res, next) {
  try {
    const r = await events({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/watchers", async function(req, res, next) {
  try {
    const r = await watchers({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/stars", async function(req, res, next) {
  try {
    const r = await stars({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/gists", async function(req, res, next) {
  try {
    const r = await gists({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
