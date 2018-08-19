import { ApiBase, Utils } from "@/helpers";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const API_URL = "https://api.instagram.com/v1";
const AUTH_URL = "https://api.instagram.com/oauth";

class Instagram extends ApiBase {
  constructor(client_id, client_secret) {
    Utils.required({ client_id, client_secret });
    super({ baseURL: API_URL });
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.redirect_uri;
    this.access_token;
  }

  authorize({ redirect_uri } = {}) {
    try {
      this.required({ redirect_uri });
      this.redirect_uri = redirect_uri;
      const data = Object.entries({
        client_id: this.client_id,
        response_type: "code",
        scope: "basic+public_content",
        redirect_uri
      })
        .map(pair => `${pair[0]}=${pair[1]}`)
        .join("&");
      return `${AUTH_URL}/authorize?${data}`;
    } catch (err) {
      this.error(err);
    }
  }

  // have to be redirect via authorize({ redirect_uri })
  async token({ code } = {}) {
    try {
      this.required({ code });
      const data = Object.entries({
        client_id: this.client_id,
        client_secret: this.client_secret,
        grant_type: "authorization_code",
        code,
        redirect_uri: this.redirect_uri
      })
        .map(pair => `${pair[0]}=${pair[1]}`)
        .join("&");

      const r = await this.client.post("/access_token", `${data}`, {
        baseURL: AUTH_URL,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      this.access_token = r.data.access_token;
      return { class: "instagram.token", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async user() {
    try {
      this.required({ access_token: this.access_token });
      const r = await this.client.get("/users/self", {
        params: {
          access_token: this.access_token
        }
      });
      return { class: "instagram.user", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async media({ min_id, max_id, count = this.perpage } = {}) {
    try {
      this.required({ access_token: this.access_token });
      const r = await this.client.get("/users/self/media/recent", {
        params: {
          access_token: this.access_token,
          ...(min_id && { min_id }),
          ...(max_id && { max_id }),
          ...(count && { count })
        }
      });
      return { class: "instagram.media", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async _bundle() {
    try {
      let r = { user: this.user(), media: this.media() };
      return {
        class: "instagram.bundle",
        data: { user: await r.user, media: await r.media }
      };
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Instagram(INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET);
