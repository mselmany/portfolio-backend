import { ApiBase } from "@/helpers";

const DRIBBBLE_CLIENT_ID = process.env.DRIBBBLE_CLIENT_ID;
const DRIBBBLE_CLIENT_SECRET = process.env.DRIBBBLE_CLIENT_SECRET;
const API_URL = "https://api.dribbble.com/v2";
const AUTH_URL = "https://dribbble.com/oauth";

class Dribbble extends ApiBase {
  constructor(client_id, client_secret) {
    super({ baseURL: API_URL, init: { client_id, client_secret } });
    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }

    const __source = { name, type, form };

    switch (type) {
      case "user": {
        const {
          id,
          name,
          login,
          avatar_url,
          bio,
          location,
          pro,
          followers_count,
          created_at,
          links
        } = payload;
        return {
          __source,
          id,
          name,
          login,
          avatar_url,
          bio,
          location,
          pro,
          followers_count,
          __createdAt: new Date(created_at).getTime(),
          links
        };
      }

      case "shots": {
        return payload.map(
          ({
            id,
            title,
            description,
            html_url,
            images,
            tags,
            published_at,
            updated_at,
            attachments,
            projects
          }) => ({
            __source,
            id,
            title,
            description,
            html_url,
            images,
            tags,
            published_at: new Date(published_at).getTime(),
            __createdAt: new Date(updated_at).getTime(),
            attachments: attachments.map(({ id, url, thumbnail_url, created_at }) => {
              return { id, url, thumbnail_url, created_at: new Date(created_at).getTime() };
            }),
            projects
          })
        );
      }

      default:
        return payload;
    }
  }

  authorize() {
    return `${AUTH_URL}/authorize?client_id=${this.client_id}`;
  }

  // have to be redirect via authorize()
  async token({ code } = {}) {
    const source = {
      name: "dribbble",
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
    const r = await this.client.post(
      "/token",
      {},
      {
        baseURL: AUTH_URL,
        params: {
          client_id: this.client_id,
          client_secret: this.client_secret,
          code
        }
      }
    );
    const { token_type, access_token } = r.data;
    this.authorization = `${token_type} ${access_token}`;
    return {
      success: true,
      source,
      data: this.messages.ACCESS_GRANTED
    };
  }

  async user() {
    const source = { name: "dribbble", type: "user", form: "staticitems" };
    if (!this.granted) {
      return {
        success: false,
        source,
        data: this.messages.NOT_AUTHORIZED
      };
    }
    this.required({ authorization: this.authorization });
    const r = await this.client.get("/user", {
      headers: {
        authorization: this.authorization
      }
    });
    return { success: true, source, data: Dribbble.parser(source, r.data) };
  }

  async shots({ page, perpage = this.perpage } = {}) {
    const source = { name: "dribbble", type: "shots", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    this.required({ authorization: this.authorization });
    const r = await this.client.get("/user/shots", {
      headers: {
        authorization: this.authorization
      },
      params: {
        ...(page && { page }),
        ...(perpage && { perpage })
      }
    });

    return { success: true, source, data: Dribbble.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "dribbble",
      type: "bucket",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }

    let r = { user: this.user(), shots: this.shots() };
    let d = { user: await r.user, shots: await r.shots };

    return {
      success: true,
      source,
      data: { staticitems: { user: d.user.data }, listitems: d.shots.data }
    };
  }
}

export default new Dribbble(DRIBBBLE_CLIENT_ID, DRIBBBLE_CLIENT_SECRET);
