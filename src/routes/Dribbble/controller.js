import { ApiBase, Utils } from "@/helpers";

const DRIBBBLE_CLIENT_ID = process.env.DRIBBBLE_CLIENT_ID;
const DRIBBBLE_CLIENT_SECRET = process.env.DRIBBBLE_CLIENT_SECRET;
const API_URL = "https://api.dribbble.com/v2";
const AUTH_URL = "https://dribbble.com/oauth";

class Dribbble extends ApiBase {
  constructor(client_id, client_secret) {
    Utils.required({ client_id, client_secret });
    super({ baseURL: API_URL });
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.authorization;
  }

  authorize() {
    try {
      return `${AUTH_URL}/authorize?client_id=${this.client_id}`;
    } catch (err) {
      this.error(err);
    }
  }

  // have to be redirect via authorize()
  async token({ code } = {}) {
    try {
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
      return { class: "dribbble.token", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async shots({ page, perpage = this.perpage } = {}) {
    try {
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
      return { class: "dribbble.shots", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  /*   
  // ! This endpoint supported only approved apps by Dribbble. If you want to fetch your likes please submit your app to Dribbble support team.
  async likes({ page, perpage = this.perpage } = {}) {
    try {
      this.required({ authorization: this.authorization });
      const r = await this.client.get("/user/likes", {
        headers: {
          authorization: this.authorization
        },
        params: {
          ...(page && { page }),
          ...(perpage && { perpage })
        }
      });
      return { class: "dribbble.likes", data: r.data };
    } catch (err) {
      this.error(err);
    }
  } */

  async _bundle() {
    try {
      let r = { shots: this.shots() };
      return { class: "dribbble.bundle", data: { shots: await r.shots } };
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Dribbble(DRIBBBLE_CLIENT_ID, DRIBBBLE_CLIENT_SECRET);
