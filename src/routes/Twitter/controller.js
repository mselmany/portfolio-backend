import { ApiBase, Utils } from "@/helpers";

const TWITTER_USERNAME = process.env.TWITTER_USERNAME;
const TWITTER_COMSUMER_KEY = process.env.TWITTER_COMSUMER_KEY;
const TWITTER_COMSUMER_SECRET = process.env.TWITTER_COMSUMER_SECRET;
const API_URL = "https://api.twitter.com/1.1";
const AUTH_URL = "https://api.twitter.com/oauth2";

class Twitter extends ApiBase {
  constructor(username, consumer_key, consumer_secret) {
    Utils.required({ username, consumer_key, consumer_secret });
    super({ baseURL: API_URL });
    this.username = username;
    this.authorization;
    this.credentials = new Buffer(
      `${consumer_key}:${consumer_secret}`
    ).toString("base64");
  }

  async token() {
    if (this.isGranted) {
      return {
        success: false,
        class: "twitter.token",
        data: this.messages.ALREADY_EXIST
      };
    }
    const r = await this.client.post(
      "/token",
      "grant_type=client_credentials",
      {
        baseURL: AUTH_URL,
        headers: {
          Authorization: `Basic ${this.credentials}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        }
      }
    );
    const { token_type, access_token } = r.data;
    this.authorization = `${token_type} ${access_token}`;
    return {
      success: true,
      class: "twitter.token",
      data: this.messages.ACCESS_GRANTED
    };
  }

  async refreshToken({ access_token } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "twitter.refreshToken",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    this.required({ access_token });
    await this.client.post(
      "/invalidate_token",
      `access_token=${access_token}`,
      {
        baseURL: AUTH_URL,
        headers: {
          Authorization: `Basic ${this.credentials}`,
          "Content-Type": "application/x-www-form-urlencoded;"
        }
      }
    );
    await this.token();
    return {
      success: true,
      class: "twitter.refreshToken",
      data: this.messages.ACCESS_GRANTED
    };
  }

  async timeline({
    user_id,
    since_id,
    count = this.perpage,
    max_id,
    trim_user,
    exclude_replies,
    include_rts
  } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "twitter.timeline",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get("/statuses/user_timeline.json", {
      headers: {
        authorization: this.authorization
      },
      params: {
        screen_name: this.username,
        ...(user_id && { user_id }),
        ...(since_id && { since_id }),
        ...(count && { count }),
        ...(max_id && { max_id }),
        ...(trim_user && { trim_user }),
        ...(exclude_replies && { exclude_replies }),
        ...(include_rts && { include_rts })
      }
    });
    return { success: true, class: "twitter.timeline", data: r.data };
  }

  async likes({
    user_id,
    since_id,
    count = this.perpage,
    max_id,
    include_rts
  } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "twitter.likes",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get("/favorites/list.json", {
      headers: {
        authorization: this.authorization
      },
      params: {
        screen_name: this.username,
        ...(user_id && { user_id }),
        ...(since_id && { since_id }),
        ...(count && { count }),
        ...(max_id && { max_id }),
        ...(include_rts && { include_rts })
      }
    });
    return {
      success: true,
      class: "twitter.likes",
      data: r.data
    };
  }

  async _bucket() {
    if (!this.isGranted) {
      return {
        success: false,
        class: "twitter.bucket",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = {
      timeline: this.timeline(),
      likes: this.likes()
    };
    return {
      success: true,
      class: "twitter.bucket",
      data: {
        timeline: await r.timeline,
        likes: await r.likes
      }
    };
  }
}

export default new Twitter(
  TWITTER_USERNAME,
  TWITTER_COMSUMER_KEY,
  TWITTER_COMSUMER_SECRET
);
