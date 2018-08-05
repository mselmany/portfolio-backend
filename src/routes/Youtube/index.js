import { Router } from "express";
import Youtube from "./controller";

const router = Router();

router.get("/activities", async function(req, res, next) {
  try {
    const r = await Youtube.activities({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/playlist/:id", async function(req, res, next) {
  try {
    const r = await Youtube.playlist({ ...req.params, ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/video/:id", async function(req, res, next) {
  try {
    const r = await Youtube.video({ ...req.params, ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

export default router;
