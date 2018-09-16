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
    switch (type) {
      case "user": {
        const _item = payload;
        return {
          __source: { name, type, form },
          id: _item.id,
          name: _item.name,
          login: _item.login,
          avatar_url: _item.avatar_url,
          bio: _item.bio,
          location: _item.location,
          pro: _item.pro,
          followers_count: _item.followers_count,
          created_at: _item.created_at,
          links: _item.links
        };
      }

      case "shots": {
        return payload.map(_item => ({
          __source: {
            name,
            type,
            form
          },
          id: _item.id,
          title: _item.title,
          description: _item.description,
          html_url: _item.html_url,
          images: _item.images,
          tags: _item.tags,
          published_at: _item.published_at,
          updated_at: _item.updated_at,
          created_at: _item.created_at,
          attachments: _item.attachments.map(it => {
            const { id, url, thumbnail_url, created_at } = it;
            return { id, url, thumbnail_url, created_at };
          }),
          projects: _item.projects
        }));
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
    if (this.granted) {
      return {
        success: false,
        class: "dribbble.token",
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
      class: "dribbble.token",
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
      data: { staticitems: d.user.data, listitems: [...d.shots.data] }
    };
  }
}

export default new Dribbble(DRIBBBLE_CLIENT_ID, DRIBBBLE_CLIENT_SECRET);
