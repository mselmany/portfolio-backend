import { Router } from "express";
import Dribbble from "./controller";

const router = Router();

router.get("/authorize", function(req, res, next) {
  try {
    res.redirect(Dribbble.authorize());
  } catch (error) {
    next(error);
  }
});

router.get("/token", async function(req, res, next) {
  try {
    const r = await Dribbble.token({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/user", async function(req, res, next) {
  try {
    const r = await Dribbble.user();
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

router.get("/shots", async function(req, res, next) {
  try {
    const r = await Dribbble.shots({ ...req.query });
    res.status(200).json(r);
  } catch (error) {
    next(error);
  }
});

export default router;
