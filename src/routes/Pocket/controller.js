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
  }

  async authorize({ redirect_uri, state } = {}) {
    try {
      this.required({ redirect_uri });
      const r = await this.client.post("/oauth/request", {
        consumer_key: this.consumer_key,
        redirect_uri,
        ...(state && { state })
      });
      return `https://getpocket.com/auth/authorize?request_token=${
        r.data.code
      }&redirect_uri=${redirect_uri}?code=${r.data.code}`;
    } catch (err) {
      this.error(err);
    }
  }

  async token({ code, state } = {}) {
    try {
      this.required({ code });
      const r = await this.client.post("/oauth/authorize", {
        consumer_key: this.consumer_key,
        code,
        ...(state && { state })
      });
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }

  async bookmarks({
    access_token,
    detailType,
    since,
    offset,
    count = this.perpage
  } = {}) {
    try {
      this.required({ access_token });
      const r = await this.client.post("/get", {
        access_token,
        consumer_key: this.consumer_key,
        state: "all",
        sort: "newest",
        detailType: detailType || "simple",
        ...(since && { since }),
        ...(offset && { offset }),
        ...(count && { count })
      });
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Pocket(POCKET_CONSUMER_KEY);
