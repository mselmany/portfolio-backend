import { Router } from "express";
import Instagram from "./controller";

const router = Router();

router.get("/authorize", async function(req, res, next) {
  try {
    res.redirect(Instagram.authorize({ ...req.query }));
  } catch (error) {
    next(error);
  }
});

router.get("/token", async function(req, res, next) {
  try {
    const r = await Instagram.token({ ...req.query });
    // ! TODO: save access_token to db.
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/user", async function(req, res, next) {
  try {
    const r = await Instagram.user({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/media", async function(req, res, next) {
  try {
    const r = await Instagram.media({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

export default router;
