import { Router } from "express";
import Raindrop from "./controller";

const router = Router();

router.get("/collection", async function(req, res, next) {
  try {
    const r = await Raindrop.collection();
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/bookmarks", async function(req, res, next) {
  try {
    const r = await Raindrop.bookmarks({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/bookmark/:id", async function(req, res, next) {
  try {
    const r = await Raindrop.bookmark({ ...req.params });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
