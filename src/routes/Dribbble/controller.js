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
    this.redirect_url = "http://localhost:3001/api/dribbble/token";
  }

  authorize() {
    return `${AUTH_URL}/authorize?client_id=${this.client_id}&redirect_uri=${
      this.redirect_url
    }`;
  }

  async token({ code, redirect_uri } = {}) {
    try {
      this.required({ code });
      return await this.client.post(
        "/token",
        {},
        {
          baseURL: AUTH_URL,
          params: {
            client_id: this.client_id,
            client_secret: this.client_secret,
            code,
            ...(redirect_uri && { redirect_uri })
          }
        }
      );
    } catch (err) {
      this.error(err);
    }
  }

  async shots({ authorization, page, perpage = this.perpage } = {}) {
    try {
      this.required({ authorization });
      return await this.client.get("/user/shots", {
        headers: {
          authorization
        },
        params: {
          ...(page && { page }),
          ...(perpage && { perpage })
        }
      });
    } catch (err) {
      this.error(err);
    }
  }

  /*   
  // ! Bu endpoint sadece Dribbble tarafından onaylanmış uygulamalarda destekleniyor.
  async likes({ authorization, page, perpage = this.perpage } = {}) {
    try {
      this.required({ authorization });
      return await this.client.get("/user/likes", {
        headers: {
          authorization
        },
        params: {
          ...(page && { page }),
          ...(perpage && { perpage })
        }
      });
    } catch (err) {
      this.error(err);
    }
  } */
}

export default new Dribbble(DRIBBBLE_CLIENT_ID, DRIBBBLE_CLIENT_SECRET);
