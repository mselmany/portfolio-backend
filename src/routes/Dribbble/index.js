import { Router } from "express";
import { authorize, token, shots } from "./controller";
import { mandatory } from "@/helpers";

const router = Router();

router.get("/authorize", function(req, res, next) {
  try {
    res.redirect(authorize());
  } catch (error) {
    next(error);
  }
});

router.get("/token", async function(req, res, next) {
  const { code } = req.query;
  try {
    mandatory({ code });
    const t = await token({ code, ...req.query });
    res.status(200).json(t.data);
  } catch (error) {
    next(error);
  }
});

router.get("/shots", async function(req, res, next) {
  const { authorization } = req.headers;
  try {
    mandatory({ authorization });
    const r = await shots({ authorization, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
});

/* router.get("/likes", async function(req, res, next) {
  const { authorization } = req.headers;
  try {
    mandatory({ authorization });
    const r = await likes({ authorization, ...req.query });
    res.status(200).json(r.data);
  } catch (error) {
    next(error);
  }
}); */

export default router;
