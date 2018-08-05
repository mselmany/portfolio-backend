import { ApiBase, Utils } from "@/helpers";

const RAINDROP_COLLECTION_ID = process.env.RAINDROP_COLLECTION_ID;
const API_URL = "https://raindrop.io/v1";

class Raindrop extends ApiBase {
  constructor(collection_id) {
    Utils.required({ collection_id });
    super({ baseURL: API_URL });
    this.collection_id = collection_id;
  }

  async collection() {
    try {
      return await this.client.get(`/collection/${this.collection_id}`);
    } catch (err) {
      this.error(err);
    }
  }

  async bookmarks({ page, perpage = this.perpage, search, sort } = {}) {
    try {
      return await this.client.get(`/bookmarks/${this.collection_id}`, {
        params: {
          ...(page && { page }),
          ...(perpage && { perpage }),
          ...(search && { search }),
          ...(sort && { sort })
        }
      });
    } catch (err) {
      this.error(err);
    }
  }

  async bookmark({ id } = {}) {
    try {
      this.required({ id });
      return await this.client.get(`/bookmark/${id}`);
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Raindrop(RAINDROP_COLLECTION_ID);
