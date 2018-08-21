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

class Bucket {
  constructor() {}

  async fetch({ filter } = {}) {
    const pick = type => filter.toLowerCase().includes(type);
    const has = type => list.hasOwnProperty(type);

    let list = {
      ...(pick("twitter") && { Twitter }),
      ...(pick("dribbble") && { Dribbble }),
      ...(pick("github") && { Github }),
      ...(pick("raindrop") && { Raindrop }),
      ...(pick("soundcloud") && { Soundcloud }),
      ...(pick("medium") && { Medium }),
      ...(pick("youtube") && { Youtube }),
      ...(pick("pocket") && { Pocket }),
      ...(pick("instagram") && { Instagram }),
      ...(pick("tumblr") && { Tumblr }),
      ...(pick("unsplash") && { Unsplash })
    };

    for (const key in list) {
      if (list.hasOwnProperty(key)) {
        const prop = list[key];
        if (
          prop.__proto__.hasOwnProperty("_bucket") &&
          typeof prop.__proto__._bucket === "function"
        ) {
          list[key] = prop._bucket();
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
  }
}

export default new Bucket();
