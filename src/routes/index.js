import { Router } from "express";
import Twitter from "./Twitter";
import Dribbble from "./Dribbble";
import Github from "./Github";
import Raindrop from "./Raindrop";
import Soundcloud from "./Soundcloud";
import Medium from "./Medium";
import Youtube from "./Youtube";
import Pocket from "./Pocket";
import Instagram from "./Instagram";

const router = Router();

router.use("/twitter", Twitter);
router.use("/dribbble", Dribbble);
router.use("/github", Github);
router.use("/raindrop", Raindrop);
router.use("/soundcloud", Soundcloud);
router.use("/youtube", Youtube);
router.use("/medium", Medium);
router.use("/pocket", Pocket);
router.use("/instagram", Instagram);

router.get("/status", function(req, res) {
  res.status(200).json({ message: "Winner winner chicken dinner" });
});

export default router;
