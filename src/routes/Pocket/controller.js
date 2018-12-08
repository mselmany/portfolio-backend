import { ApiBase } from "@/helpers";

const POCKET_CONSUMER_KEY = process.env.POCKET_CONSUMER_KEY;
const API_URL = "https://getpocket.com/v3";

class Pocket extends ApiBase {
  constructor(consumer_key) {
    super(
      { baseURL: API_URL, init: { consumer_key } },
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

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }
    const __source = { name, type, form };
    switch (type) {
      case "bookmarks": {
        let { list, since } = payload;

        return Object.values(list).map(
          ({
            item_id,
            given_url,
            given_title,
            favorite,
            time_added,
            excerpt,
            top_image_url,
            is_article,
            word_count,
            lang,
            time_to_read
          }) => {
            return {
              __source,
              item_id,
              given_url,
              given_title,
              favorite: favorite === "1",
              __createdAt: time_added * 1000,
              excerpt,
              top_image_url: top_image_url || "",
              is_article: is_article === "1",
              word_count,
              lang,
              time_to_read: time_to_read || null
            };
          }
        );
      }

      default: {
        return payload;
      }
    }
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
    const source = {
      name: "pocket",
      type: "token",
      form: "staticitems"
    };
    if (this.granted) {
      return {
        success: false,
        source,
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
      source,
      data: this.messages.ACCESS_GRANTED
    };
  }

  async bookmarks({ detailType = "simple", favorite, since, offset, count = this.perpage } = {}) {
    const source = { name: "pocket", type: "bookmarks", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
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
      ...(favorite && { favorite }),
      ...(since && { since }),
      ...(offset && { offset }),
      ...(count && { count })
    });
    return { success: true, source, data: Pocket.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "pocket",
      type: "bucket",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = {
      bookmarks: this.bookmarks()
    };
    let d = {
      bookmarks: await r.bookmarks
    };

    return {
      success: true,
      source,
      data: { staticitems: {}, listitems: d.bookmarks.data }
    };
  }
}

export default new Pocket(POCKET_CONSUMER_KEY);
