import { Router } from "express";
import { authorize, token, shots } from "./controller";

const router = Router();

router.get("/authorize", function(req, res, next) {
  try {
    res.redirect(authorize());
  } catch (error) {
    next(error);
  }
});

router.get("/token", async function(req, res, next) {
  try {
    const { code, redirect_uri } = req.query;
    const t = await token({ code, redirect_uri });
    res.status(200).json(t.data);
  } catch (error) {
    next(error);
  }
});

router.get("/shots", async function(req, res, next) {
  try {
    const { authorization } = req.headers;
    const r = await shots({ authorization, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

/* router.get("/likes", async function(req, res, next) {
  try {
    const { authorization } = req.headers;
    const r = await likes({ authorization, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
}); */

export default router;
