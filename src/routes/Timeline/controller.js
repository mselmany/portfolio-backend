import { Utils } from "@/helpers";
import Twitter from "../Twitter/controller";
import Dribbble from "../Dribbble/controller";
import Github from "../Github/controller";
import Raindrop from "../Raindrop/controller";
import Soundcloud from "../Soundcloud/controller";
import Medium from "../Medium/controller";
import Youtube from "../Youtube/controller";
import Pocket from "../Pocket/controller";
import Instagram from "../Instagram/controller";
import Tumblr from "../Tumblr/controller";
import Unsplash from "../Unsplash/controller";

class Timeline {
  constructor() {}

  async fetch({ filter } = {}) {
    // try {
    const pick = type => filter.toLowerCase().includes(type);
    const has = type => list.hasOwnProperty(type);

    let list = {
      ...(pick("twitter") && Twitter.isGranted && { Twitter }),
      ...(pick("dribbble") && Dribbble.isGranted && { Dribbble }),
      ...(pick("github") && Github.isGranted && { Github }),
      ...(pick("raindrop") && Raindrop.isGranted && { Raindrop }),
      ...(pick("soundcloud") && Soundcloud.isGranted && { Soundcloud }),
      ...(pick("medium") && Medium.isGranted && { Medium }),
      ...(pick("youtube") && Youtube.isGranted && { Youtube }),
      ...(pick("pocket") && Pocket.isGranted && { Pocket }),
      ...(pick("instagram") && Instagram.isGranted && { Instagram }),
      ...(pick("tumblr") && Tumblr.isGranted && { Tumblr }),
      ...(pick("unsplash") && Unsplash.isGranted && { Unsplash })
    };

    for (const key in list) {
      if (list.hasOwnProperty(key)) {
        const prop = list[key];
        if (
          prop.__proto__.hasOwnProperty("_bundle") &&
          typeof prop.__proto__._bundle === "function"
        ) {
          list[key] = prop._bundle();
        }
      }
    }

    return {
      ...(has("Twitter") && { Twitter: await list.Twitter }),
      ...(has("Dribbble") && { Dribbble: await list.Dribbble }),
      ...(has("Github") && { Github: await list.Github }),
      ...(has("Raindrop") && { Raindrop: await list.Raindrop }),
      ...(has("Soundcloud") && { Soundcloud: await list.Soundcloud }),
      ...(has("Medium") && { Medium: await list.Medium }),
      ...(has("Youtube") && { Youtube: await list.Youtube }),
      ...(has("Pocket") && { Pocket: await list.Pocket }),
      ...(has("Instagram") && { Instagram: await list.Instagram }),
      ...(has("Tumblr") && { Tumblr: await list.Tumblr }),
      ...(has("Unsplash") && { Unsplash: await list.Unsplash })
    };
    // } catch (err) {
    //   Utils.error(err);
    // }
  }
}

export default new Timeline();