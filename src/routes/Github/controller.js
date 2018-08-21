import { ApiBase, Utils } from "@/helpers";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const API_URL = "https://api.github.com";

class Github extends ApiBase {
  constructor(username) {
    Utils.required({ username });
    super({ baseURL: API_URL });
    this.username = username;
    this.authorization = true;
  }

  async events({ page, per_page = this.perpage } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "github.events",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.username}/events`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return { success: true, class: "github.events", data: r.data };
  }

  async watchers({ page, per_page = this.perpage } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "github.watchers",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.username}/subscriptions`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return { success: true, class: "github.watchers", data: r.data };
  }

  async stars({ page, per_page = this.perpage } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "github.stars",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.username}/starred`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return { success: true, class: "github.stars", data: r.data };
  }

  async gists({ page, per_page = this.perpage } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "github.gists",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.username}/gists`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return { success: true, class: "github.gists", data: r.data };
  }

  async _bucket() {
    if (!this.isGranted) {
      return {
        success: false,
        class: "github.bucket",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = {
      events: this.events(),
      watchers: this.watchers(),
      stars: this.stars(),
      gists: this.gists()
    };
    return {
      success: true,
      class: "github.bucket",
      data: {
        events: await r.events,
        watchers: await r.watchers,
        stars: await r.stars,
        gists: await r.gists
      }
    };
  }
}

export default new Github(GITHUB_USERNAME);
