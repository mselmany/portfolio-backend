import { ApiBase, Utils } from "@/helpers";

const UNSPLASH_USERNAME = process.env.UNSPLASH_USERNAME;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const API_URL = "https://api.unsplash.com";

class Unsplash extends ApiBase {
  constructor(username, access_key) {
    Utils.required({ username, access_key });
    super(
      { baseURL: API_URL },
      {
        interceptor: config =>
          (config.headers = {
            ...config.headers,
            "Accept-Version": "v1",
            Authorization: `Client-ID ${access_key}`
          })
      }
    );
    this.username = username;
    this.access_key = access_key;
  }

  async profile({ page, per_page = this.perpage } = {}) {
    try {
      let r = await this.client.get(`/users/${this.username}`, {
        params: {
          ...(page && { page }),
          ...(per_page && { per_page })
        }
      });
      return { class: "unsplash.profile", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async photos({
    order_by,
    stats,
    resolution,
    quantity,
    page,
    per_page = this.perpage
  } = {}) {
    try {
      let r = await this.client.get(`/users/${this.username}/photos`, {
        params: {
          ...(order_by && { order_by }),
          ...(stats && { stats }),
          ...(resolution && { resolution }),
          ...(quantity && { quantity }),
          ...(page && { page }),
          ...(per_page && { per_page })
        }
      });
      return { class: "unsplash.photos", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async likes({ order_by, page, per_page = this.perpage } = {}) {
    try {
      let r = await this.client.get(`/users/${this.username}/likes`, {
        params: {
          ...(order_by && { order_by }),
          ...(page && { page }),
          ...(per_page && { per_page })
        }
      });
      return { class: "unsplash.likes", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async collections({ page, per_page = this.perpage } = {}) {
    try {
      let r = await this.client.get(`/users/${this.username}/collections`, {
        params: {
          ...(page && { page }),
          ...(per_page && { per_page })
        }
      });
      return { class: "unsplash.collections", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async statistics({ resolution, quantity } = {}) {
    try {
      let r = await this.client.get(`/users/${this.username}/statistics`, {
        params: {
          ...(resolution && { resolution }),
          ...(quantity && { quantity })
        }
      });
      return { class: "unsplash.statistics", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Unsplash(UNSPLASH_USERNAME, UNSPLASH_ACCESS_KEY);
