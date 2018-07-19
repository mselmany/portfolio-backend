import { Router } from "express";
import { authorize, token, stars, events } from "./controller";

const router = Router();

router.get("/authorize", function(req, res, next) {
  try {
    res.redirect(authorize());
  } catch (error) {
    next(error);
  }
});

router.get("/token", async function(req, res, next) {
  try {
    const { code, state, redirect_uri } = req.query;
    const t = await token({ code, state, redirect_uri });
    res.status(200).json(t.data);
  } catch (error) {
    next(error);
  }
});

router.get("/events", async function(req, res, next) {
  try {
    const { authorization } = req.headers;
    const r = await events({ authorization, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/stars", async function(req, res, next) {
  try {
    const { authorization } = req.headers;
    const r = await stars({ authorization, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
