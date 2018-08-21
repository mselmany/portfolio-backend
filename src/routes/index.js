import { Router } from "express";
import Bucket from "./Bucket";
import Twitter from "./Twitter";
import Dribbble from "./Dribbble";
import Github from "./Github";
import Raindrop from "./Raindrop";
import Soundcloud from "./Soundcloud";
import Medium from "./Medium";
import Youtube from "./Youtube";
import Pocket from "./Pocket";
import Instagram from "./Instagram";
import Tumblr from "./Tumblr";
import Unsplash from "./Unsplash";

const router = Router();

router.use(Bucket);
router.use("/twitter", Twitter);
router.use("/dribbble", Dribbble);
router.use("/github", Github);
router.use("/raindrop", Raindrop);
router.use("/soundcloud", Soundcloud);
router.use("/medium", Medium);
router.use("/youtube", Youtube);
router.use("/pocket", Pocket);
router.use("/instagram", Instagram);
router.use("/tumblr", Tumblr);
router.use("/unsplash", Unsplash);

router.get("/status", function(req, res) {
  res.status(200).json({ status: "OK", message: "Server is up and running." });
});

export default router;
