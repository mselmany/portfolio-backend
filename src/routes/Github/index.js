import { Router } from "express";
import Github from "./controller";

const router = Router();

router.get("/events", async function(req, res, next) {
  try {
    const r = await Github.events({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/watchers", async function(req, res, next) {
  try {
    const r = await Github.watchers({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/stars", async function(req, res, next) {
  try {
    const r = await Github.stars({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/gists", async function(req, res, next) {
  try {
    const r = await Github.gists({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
