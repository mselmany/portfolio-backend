import { ApiBase, Utils } from "@/helpers";

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

  async shots({ page, perpage = this.perpage } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "dribbble.shots",
        data: this.messages.NOT_AUTHORIZED
      };
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
    return { success: true, class: "dribbble.shots", data: r.data };
  }

  /* 
  // ! This endpoint supported only approved apps by Dribbble. If you want to fetch your likes please submit your app to Dribbble support team.
  async likes({ page, perpage = this.perpage } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "dribbble.likes",
        data: this.messages.NOT_AUTHORIZED
      };
    }
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
    return { success: true, class: "dribbble.likes", data: r.data };
  } */

  async _bucket() {
    if (!this.granted) {
      return {
        success: false,
        class: "dribbble.bucket",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = { shots: this.shots() };
    return {
      success: true,
      class: "dribbble.bucket",
      data: { shots: await r.shots }
    };
  }
}

export default new Dribbble(DRIBBBLE_CLIENT_ID, DRIBBBLE_CLIENT_SECRET);
