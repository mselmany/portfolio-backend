import { Router } from "express";
import Medium from "./controller";

const router = Router();

router.get("/user", async function(req, res, next) {
  try {
    const r = await Medium.user();
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/latest", async function(req, res, next) {
  try {
    const r = await Medium.latest();
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/recommended", async function(req, res, next) {
  try {
    const r = await Medium.recommended();
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/responses", async function(req, res, next) {
  try {
    const r = await Medium.responses();
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/highlights", async function(req, res, next) {
  try {
    const r = await Medium.highlights();
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

export default router;
