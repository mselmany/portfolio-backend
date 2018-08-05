import { Router } from "express";
import Soundcloud from "./controller";

const router = Router();

router.get("/user", async function(req, res, next) {
  try {
    const r = await Soundcloud.user({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/playlists", async function(req, res, next) {
  try {
    const r = await Soundcloud.playlists({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/comments", async function(req, res, next) {
  try {
    const r = await Soundcloud.comments({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/favorites", async function(req, res, next) {
  try {
    const r = await Soundcloud.favorites({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/tracks", async function(req, res, next) {
  try {
    const r = await Soundcloud.tracks({ ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/track/:id", async function(req, res, next) {
  try {
    const r = await Soundcloud.track({ ...req.params });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
