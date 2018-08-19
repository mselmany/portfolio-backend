import { ApiBase, Utils } from "@/helpers";

const RAINDROP_COLLECTION_ID = process.env.RAINDROP_COLLECTION_ID;
const API_URL = "https://raindrop.io/v1";

class Raindrop extends ApiBase {
  constructor(collection_id) {
    Utils.required({ collection_id });
    super({ baseURL: API_URL });
    this.collection_id = collection_id;
    this.authorization = true;
  }

  async collection({ collection_id = this.collection_id } = {}) {
    try {
      const r = await this.client.get(`/collection/${collection_id}`);
      return { class: "raindrop.collection", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async bookmarks({
    collection_id = this.collection_id,
    page,
    perpage = this.perpage,
    search,
    sort
  } = {}) {
    try {
      const r = await this.client.get(`/bookmarks/${collection_id}`, {
        params: {
          ...(page && { page }),
          ...(perpage && { perpage }),
          ...(search && { search }),
          ...(sort && { sort })
        }
      });
      return { class: "raindrop.bookmarks", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async bookmark({ id } = {}) {
    try {
      this.required({ id });
      const r = await this.client.get(`/bookmark/${id}`);
      return { class: "raindrop.bookmark", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async _bundle() {
    try {
      let r = {
        collection: this.collection(),
        bookmarks: this.bookmarks()
      };
      return {
        class: "raindrop.bundle",
        data: { collection: await r.collection, bookmarks: await r.bookmarks }
      };
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Raindrop(RAINDROP_COLLECTION_ID);
