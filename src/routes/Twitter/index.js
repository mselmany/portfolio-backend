import { Router } from "express";
import { token, invalidateToken, timeline, likes } from "./controller";

const router = Router();

router.get("/token", async function(req, res, next) {
  try {
    const t = await token();
    res.status(200).json(t.data);
  } catch (error) {
    next(error);
  }
});

router.post("/invalidate_token", async function(req, res, next) {
  try {
    const { access_token } = req.body;
    const r = await invalidateToken(access_token);
    res.status(200).json({
      message: "Twitter 'access_token' successfully invalidated."
    });
  } catch (error) {
    next(error);
  }
});

router.get("/timeline", async function(req, res, next) {
  try {
    const { authorization } = req.headers;
    const r = await timeline({ authorization, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/likes", async function(req, res, next) {
  try {
    const { authorization } = req.headers;
    const r = await likes({ authorization, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
