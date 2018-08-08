import { Router } from "express";
import Dribbble from "./controller";

const router = Router();

router.get("/authorize", function(req, res, next) {
  try {
    res.redirect(Dribbble.authorize({ ...req.query }));
  } catch (error) {
    next(error);
  }
});

router.get("/token", async function(req, res, next) {
  try {
    const r = await Dribbble.token({ ...req.query });
    // ! TODO: save access_token to db.
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/shots", async function(req, res, next) {
  try {
    const r = await Dribbble.shots({ ...req.headers, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
