import { ApiBase } from "@/helpers";

const API_URL = "https://raindrop.io/v1";

class Raindrop extends ApiBase {
  constructor() {
    super({ baseURL: API_URL });
  }

  async collection({ collection_id } = {}) {
    try {
      this.required({ collection_id });
      const r = await this.client.get(`/collection/${collection_id}`);
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }

  async bookmarks({
    collection_id,
    page,
    perpage = this.perpage,
    search,
    sort
  } = {}) {
    try {
      this.required({ collection_id });
      const r = await this.client.get(`/bookmarks/${collection_id}`, {
        params: {
          ...(page && { page }),
          ...(perpage && { perpage }),
          ...(search && { search }),
          ...(sort && { sort })
        }
      });
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }

  async bookmark({ id } = {}) {
    try {
      this.required({ id });
      const r = await this.client.get(`/bookmark/${id}`);
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Raindrop();
