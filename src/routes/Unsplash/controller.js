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
    this.authorization = access_key;
  }

  async profile({ page, per_page = this.perpage } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "unsplash.profile",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = await this.client.get(`/users/${this.username}`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return {
      success: true,
      class: "unsplash.profile",
      data: r.data
    };
  }

  async photos({
    order_by,
    stats,
    resolution,
    quantity,
    page,
    per_page = this.perpage
  } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "unsplash.photos",
        data: this.messages.NOT_AUTHORIZED
      };
    }
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
    return {
      success: true,
      class: "unsplash.photos",
      data: r.data
    };
  }

  async likes({ order_by, page, per_page = this.perpage } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "unsplash.likes",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = await this.client.get(`/users/${this.username}/likes`, {
      params: {
        ...(order_by && { order_by }),
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return {
      success: true,
      class: "unsplash.likes",
      data: r.data
    };
  }

  async collections({ page, per_page = this.perpage } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "unsplash.collections",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = await this.client.get(`/users/${this.username}/collections`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return {
      success: true,
      class: "unsplash.collections",
      data: r.data
    };
  }

  async statistics({ resolution, quantity } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "unsplash.statistics",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = await this.client.get(`/users/${this.username}/statistics`, {
      params: {
        ...(resolution && { resolution }),
        ...(quantity && { quantity })
      }
    });
    return {
      success: true,
      class: "unsplash.statistics",
      data: r.data
    };
  }

  async _bucket() {
    if (!this.isGranted) {
      return {
        success: false,
        class: "unsplash.bucket",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = {
      profile: this.profile(),
      photos: this.photos(),
      likes: this.likes(),
      collections: this.collections(),
      statistics: this.statistics()
    };
    return {
      success: true,
      class: "unsplash.bucket",
      data: {
        profile: await r.profile,
        photos: await r.photos,
        likes: await r.likes,
        collections: await r.collections,
        statistics: await r.statistics
      }
    };
  }
}

export default new Unsplash(UNSPLASH_USERNAME, UNSPLASH_ACCESS_KEY);
