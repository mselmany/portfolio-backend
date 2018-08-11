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
    this.credentials = new Buffer(
      `${consumer_key}:${consumer_secret}`
    ).toString("base64");
  }

  async token() {
    try {
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
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }

  async invalidateToken({ access_token }) {
    try {
      this.required({ access_token });
      const r = await this.client.post(
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
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }

  async timeline({
    authorization,
    user_id,
    since_id,
    count,
    max_id,
    trim_user,
    exclude_replies,
    include_rts
  }) {
    try {
      this.required({ authorization });
      const r = await this.client.get("/statuses/user_timeline.json", {
        headers: {
          authorization
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
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }

  async likes({
    authorization,
    user_id,
    since_id,
    count,
    max_id,
    include_rts
  }) {
    try {
      this.required({ authorization });
      const r = await this.client.get("/favorites/list.json", {
        headers: {
          authorization
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
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Twitter(
  TWITTER_USERNAME,
  TWITTER_COMSUMER_KEY,
  TWITTER_COMSUMER_SECRET
);
