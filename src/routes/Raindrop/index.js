import { Router } from "express";
import { bookmarks, bookmark, collection } from "./controller";
import { mandatory } from "@/helpers";

const router = Router();

router.get("/collection", async function(req, res, next) {
  try {
    const r = await collection();
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/bookmarks", async function(req, res, next) {
  try {
    const r = await bookmarks({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/bookmark/:id", async function(req, res, next) {
  const { id } = req.params;
  try {
    mandatory({ id });
    const r = await bookmark({ id });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
