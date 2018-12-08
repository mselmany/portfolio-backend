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

    // this.cache = null;
  }

  async list({ filter } = {}) {
    // if (this.cache) {
    //   return this.cache;
    // }
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
          v.__proto__.hasOwnProperty("_bucket") && v.initialized && v.granted
            ? v._bucket()
            : {
                success: false,
                source: { name: "bucket", type: "list", form: "listitems" },
                data: messages.NOT_INITIALIZED
              }
        ];
      });

    // wait applied _buckets
    let resp = await Promise.all(list.map(item => item[1]));

    let r = {};
    list.forEach((item, index) => {
      // match keys and its _bucket responses by indexes
      if (resp[index].success) {
        r[item[0]] = resp[index];
      }
    });
    // this.cache = r;
    return r;
  }

  async status() {
    let r = {};
    Object.entries(this.items).forEach(([k, v]) => {
      r[k] = v.initialized && v.granted;
    });
    return r;
  }
}

export default new Bucket();
