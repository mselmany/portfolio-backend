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
    this.authorization;
  }

  async authorize({ redirect_uri } = {}) {
    this.required({ redirect_uri });
    const r = await this.client.post("/oauth/request", {
      consumer_key: this.consumer_key,
      redirect_uri
    });
    return `https://getpocket.com/auth/authorize?request_token=${
      r.data.code
    }&redirect_uri=${redirect_uri}?code=${r.data.code}`;
  }

  async token({ code } = {}) {
    if (this.isGranted) {
      return {
        success: false,
        class: "pocket.token",
        data: this.messages.ALREADY_EXIST
      };
    }
    this.required({ code });
    const r = await this.client.post("/oauth/authorize", {
      consumer_key: this.consumer_key,
      code
    });
    this.authorization = r.data.access_token;
    return {
      success: true,
      class: "pocket.token",
      data: this.messages.ACCESS_GRANTED
    };
  }

  async bookmarks({
    detailType = "simple",
    since,
    offset,
    count = this.perpage
  } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "pocket.bookmarks",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    this.required({
      authorization: this.authorization,
      consumer_key: this.consumer_key
    });
    const r = await this.client.post("/get", {
      access_token: this.authorization,
      consumer_key: this.consumer_key,
      state: "all",
      sort: "newest",
      detailType,
      ...(since && { since }),
      ...(offset && { offset }),
      ...(count && { count })
    });
    return { success: true, class: "pocket.bookmarks", data: r.data };
  }

  async _bucket() {
    if (!this.isGranted) {
      return {
        success: false,
        class: "pocket.bucket",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = {
      bookmarks: this.bookmarks()
    };
    return {
      success: true,
      class: "pocket.bucket",
      data: { bookmarks: await r.bookmarks }
    };
  }
}

export default new Pocket(POCKET_CONSUMER_KEY);
