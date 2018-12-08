import { ApiBase } from "@/helpers";

const RAINDROP_COLLECTION_ID = process.env.RAINDROP_COLLECTION_ID;
const API_URL = "https://raindrop.io/v1";

class Raindrop extends ApiBase {
  constructor(collection_id) {
    super({ baseURL: API_URL, init: { collection_id } });
    this.collection_id = collection_id;
    this.authorization = true;
  }

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }
    const __source = { name, type, form };
    switch (type) {
      case "collection": {
        let {
          _id,
          title,
          user,
          excerpt,
          background,
          created,
          count,
          shortLink,
          cover
        } = payload.item;

        return {
          __source,
          _id,
          title,
          user: user.$id,
          excerpt,
          background,
          __createdAt: new Date(created).getTime(),
          count,
          shortLink,
          cover: cover && cover.length && "https://raindrop.io" + cover[0]
        };
      }

      case "bookmarks": {
        let { items, collectionId } = payload;
        return items.map(
          ({ _id, type, user, link, title, excerpt, cover, domain, lastUpdate, tags, media }) => {
            return {
              __source,
              collectionId,
              type,
              id: _id,
              user: user.$id,
              link,
              title,
              excerpt,
              cover,
              domain,
              __createdAt: new Date(lastUpdate).getTime(),
              tags,
              media
            };
          }
        );
      }

      case "bookmark": {
        const {
          collection,
          type,
          _id,
          user,
          link,
          title,
          excerpt,
          cover,
          domain,
          lastUpdate,
          tags,
          media
        } = payload.item;

        return {
          __source,
          collectionId: collection.$id,
          type,
          id: _id,
          user: user.$id,
          link,
          title,
          excerpt,
          cover,
          domain,
          __createdAt: new Date(lastUpdate).getTime(),
          tags,
          media
        };
      }

      default: {
        return payload;
      }
    }
  }

  async collection({ collection_id = this.collection_id } = {}) {
    const source = {
      name: "raindrop",
      type: "collection",
      form: "staticitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/collection/${collection_id}`);
    return { success: true, source, data: Raindrop.parser(source, r.data) };
  }

  async bookmarks({
    collection_id = this.collection_id,
    page,
    perpage = this.perpage,
    search,
    sort
  } = {}) {
    const source = { name: "raindrop", type: "bookmarks", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/bookmarks/${collection_id}`, {
      params: {
        ...(page && { page }),
        ...(perpage && { perpage }),
        ...(search && { search }),
        ...(sort && { sort })
      }
    });
    return { success: true, source, data: Raindrop.parser(source, r.data) };
  }

  async bookmark({ id } = {}) {
    const source = { name: "raindrop", type: "bookmark", form: "staticitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    this.required({ id });
    const r = await this.client.get(`/bookmark/${id}`);
    return { success: true, source, data: Raindrop.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "raindrop",
      type: "bucket",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = {
      collection: this.collection(),
      bookmarks: this.bookmarks()
    };
    let d = {
      collection: await r.collection,
      bookmarks: await r.bookmarks
    };

    return {
      success: true,
      source,
      data: {
        staticitems: { collection: d.collection.data },
        listitems: d.bookmarks.data
      }
    };
  }
}

export default new Raindrop(RAINDROP_COLLECTION_ID);
