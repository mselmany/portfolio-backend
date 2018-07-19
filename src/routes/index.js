import { Router } from "express";
import Twitter from "./Twitter";
import Dribbble from "./Dribbble";
import Github from "./Github";

const router = Router();

router.use("/twitter", Twitter);
router.use("/dribbble", Dribbble);
router.use("/github", Github);

router.get("/status", function(req, res) {
  res.status(200).json({ message: "Winner winner chicken dinner" });
});

export default router;