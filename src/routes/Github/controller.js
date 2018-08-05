import { ApiBase, Utils } from "@/helpers";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const API_URL = "https://api.github.com";

class Github extends ApiBase {
  constructor(username) {
    Utils.required({ username });
    super({ baseURL: API_URL });
    this.username = username;
  }

  async events({ page } = {}) {
    try {
      return await this.client.get(`/users/${this.username}/events`, {
        params: {
          ...(page && { page })
        }
      });
    } catch (err) {
      this.error(err);
    }
  }

  async watchers({ page } = {}) {
    try {
      return await this.client.get(`/users/${this.username}/subscriptions`, {
        params: {
          ...(page && { page })
        }
      });
    } catch (err) {
      this.error(err);
    }
  }

  async stars({ page, per_page = this.perpage } = {}) {
    try {
      return await this.client.get(`/users/${this.username}/starred`, {
        params: {
          ...(page && { page }),
          ...(per_page && { per_page })
        }
      });
    } catch (err) {
      this.error(err);
    }
  }

  async gists({ page, per_page = this.perpage } = {}) {
    try {
      return await this.client.get(`/users/${this.username}/gists`, {
        params: {
          ...(page && { page }),
          ...(per_page && { per_page })
        }
      });
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Github(GITHUB_USERNAME);
