import { ApiBase, Utils } from "@/helpers";

const POCKET_CONSUMER_KEY = process.env.POCKET_CONSUMER_KEY;
const API_URL = "https://getpocket.com/v3";

class Pocket extends ApiBase {
  constructor(consumer_key) {
    Utils.required({ consumer_key });
    super(
      { baseURL: API_URL },
      {
        interceptor: config =>
          (config.headers = {
            ...config.headers,
            "Content-Type": "application/json; charset=UTF-8;",
            "X-Accept": "application/json"
          })
      }
    );
    this.consumer_key = consumer_key;
    this.access_token;
  }

  async authorize({ redirect_uri } = {}) {
    try {
      this.required({ redirect_uri });
      const r = await this.client.post("/oauth/request", {
        consumer_key: this.consumer_key,
        redirect_uri
      });
      return `https://getpocket.com/auth/authorize?request_token=${
        r.data.code
      }&redirect_uri=${redirect_uri}?code=${r.data.code}`;
    } catch (err) {
      this.error(err);
    }
  }

  async token({ code } = {}) {
    try {
      this.required({ code });
      const r = await this.client.post("/oauth/authorize", {
        consumer_key: this.consumer_key,
        code
      });
      this.access_token = r.data.access_token;
      return { class: "pocket.token", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async bookmarks({
    detailType = "simple",
    since,
    offset,
    count = this.perpage
  } = {}) {
    try {
      this.required({
        access_token: this.access_token,
        consumer_key: this.consumer_key
      });
      const r = await this.client.post("/get", {
        access_token: this.access_token,
        consumer_key: this.consumer_key,
        state: "all",
        sort: "newest",
        detailType,
        ...(since && { since }),
        ...(offset && { offset }),
        ...(count && { count })
      });
      return { class: "pocket.bookmarks", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async _bundle() {
    if (!this.access_token) {
      return "auth needed!";
    }
    let r = {
      bookmarks: this.bookmarks()
    };
    return { class: "pocket.bundle", data: { bookmarks: await r.bookmarks } };
  }
}

export default new Pocket(POCKET_CONSUMER_KEY);
