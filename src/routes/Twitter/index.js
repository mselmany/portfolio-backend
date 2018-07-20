import { Router } from "express";
import { token, invalidateToken, timeline, likes } from "./controller";
import { mandatory } from "@/helpers";

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
  const { access_token } = req.body;
  try {
    mandatory({ access_token });
    const r = await invalidateToken({ access_token });
    res.status(200).json({
      message: "Twitter 'access_token' successfully invalidated.",
      invalidated_token: r.data.access_token
    });
  } catch (error) {
    next(error);
  }
});

router.get("/timeline", async function(req, res, next) {
  const { authorization } = req.headers;
  try {
    mandatory({ authorization });
    const r = await timeline({ authorization, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

router.get("/likes", async function(req, res, next) {
  const { authorization } = req.headers;
  try {
    mandatory({ authorization });
    const r = await likes({ authorization, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

export default router;
