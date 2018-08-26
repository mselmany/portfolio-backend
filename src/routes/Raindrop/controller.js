import { ApiBase, Utils } from "@/helpers";

const RAINDROP_COLLECTION_ID = process.env.RAINDROP_COLLECTION_ID;
const API_URL = "https://raindrop.io/v1";

class Raindrop extends ApiBase {
  constructor(collection_id) {
    super({ baseURL: API_URL, init: { collection_id } });
    this.collection_id = collection_id;
    this.authorization = true;
  }

  async collection({ collection_id = this.collection_id } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "raindrop.collection",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/collection/${collection_id}`);
    return { success: true, class: "raindrop.collection", data: r.data };
  }

  async bookmarks({
    collection_id = this.collection_id,
    page,
    perpage = this.perpage,
    search,
    sort
  } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "raindrop.bookmarks",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/bookmarks/${collection_id}`, {
      params: {
        ...(page && { page }),
        ...(perpage && { perpage }),
        ...(search && { search }),
        ...(sort && { sort })
      }
    });
    return { success: true, class: "raindrop.bookmarks", data: r.data };
  }

  async bookmark({ id } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "raindrop.bookmark",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    this.required({ id });
    const r = await this.client.get(`/bookmark/${id}`);
    return { success: true, class: "raindrop.bookmark", data: r.data };
  }

  async _bucket() {
    if (!this.granted) {
      return {
        success: false,
        class: "raindrop.bucket",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = {
      collection: this.collection(),
      bookmarks: this.bookmarks()
    };
    return {
      success: true,
      class: "raindrop.bucket",
      data: { collection: await r.collection, bookmarks: await r.bookmarks }
    };
  }
}

export default new Raindrop(RAINDROP_COLLECTION_ID);
