import { ApiBase, Utils } from "@/helpers";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const API_URL = "https://api.github.com";

class Github extends ApiBase {
  constructor(username) {
    Utils.required({ username });
    super({ baseURL: API_URL });
    this.username = username;
  }

  async events({ page, per_page = this.perpage } = {}) {
    try {
      const r = await this.client.get(`/users/${this.username}/events`, {
        params: {
          ...(page && { page }),
          ...(per_page && { per_page })
        }
      });
      return { class: "github.events", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async watchers({ page, per_page = this.perpage } = {}) {
    try {
      const r = await this.client.get(`/users/${this.username}/subscriptions`, {
        params: {
          ...(page && { page }),
          ...(per_page && { per_page })
        }
      });
      return { class: "github.watchers", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async stars({ page, per_page = this.perpage } = {}) {
    try {
      const r = await this.client.get(`/users/${this.username}/starred`, {
        params: {
          ...(page && { page }),
          ...(per_page && { per_page })
        }
      });
      return { class: "github.stars", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async gists({ page, per_page = this.perpage } = {}) {
    try {
      const r = await this.client.get(`/users/${this.username}/gists`, {
        params: {
          ...(page && { page }),
          ...(per_page && { per_page })
        }
      });
      return { class: "github.gists", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async _bundle() {
    try {
      let r = {
        events: this.events(),
        watchers: this.watchers(),
        stars: this.stars(),
        gists: this.gists()
      };
      return {
        class: "github.bundle",
        data: {
          events: await r.events,
          watchers: await r.watchers,
          stars: await r.stars,
          gists: await r.gists
        }
      };
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Github(GITHUB_USERNAME);
