import messages from "@/messages";
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
  constructor() {
    this.items = {
      Twitter,
      Dribbble,
      Github,
      Raindrop,
      Soundcloud,
      Medium,
      Youtube,
      Pocket,
      Instagram,
      // Tumblr, // !TODO: tumblr gizlilik sorunu yüzünden fail veriyor, hepsinin faile düşmesine sebep oluyor. promise.all yerine teker teker awaitle yapabilirsin
      Unsplash
    };
  }

  async list({ filter } = {}) {
    const filterlist = filter ? filter.toLowerCase().split(",") : false;

    let list = Object.entries(this.items)
      .filter(kv => {
        const [k, v] = kv;
        // filter by filterlist or pick all
        return filterlist ? filterlist.includes(k.toLowerCase()) : true;
      })
      .map(kv => {
        const [k, v] = kv;
        // if it has _bucket method, apply it or return null
        return [
          k,
          v.__proto__.hasOwnProperty("_bucket") && v.initialized
            ? v._bucket()
            : {
                success: false,
                class: "bucket.list",
                data: messages.NOT_INITIALIZED
              }
        ];
      });

    // wait applied _buckets
    let r = {};
    for (const kv of list) {
      const [k, v] = kv;
      r = { ...r, [k]: await v };
    }
    return r;
  }

  async status() {
    let r = {};
    Object.entries(this.items).forEach(kv => {
      const [k, v] = kv;
      r[k] = v.initialized && v.granted;
    });
    return r;
  }
}

export default new Bucket();
