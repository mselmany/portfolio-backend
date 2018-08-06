import { Router } from "express";
import Pocket from "./controller";

const router = Router();

router.get("/authorize", async function(req, res, next) {
  try {
    const url = await Pocket.authorize({ ...req.query });
    res.redirect(url);
  } catch (error) {
    next(error);
  }
});

router.get("/token", async function(req, res, next) {
  try {
    const r = await Pocket.token({ ...req.query });
    // ! TODO: save access_token to db.
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/bookmarks", async function(req, res, next) {
  try {
    const r = await Pocket.bookmarks({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
