import { ApiBase } from "@/helpers";

const UNSPLASH_USERNAME = process.env.UNSPLASH_USERNAME;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const API_URL = "https://api.unsplash.com";

class Unsplash extends ApiBase {
  constructor(username, access_key) {
    super(
      { baseURL: API_URL, init: { username, access_key } },
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

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }
    const __source = { name, type, form };
    switch (type) {
      case "profile": {
        const {
          id,
          updated_at,
          username,
          name: _name,
          portfolio_url,
          bio,
          location,
          links,
          profile_image,
          total_collections,
          total_likes,
          total_photos,
          downloads,
          followers_count,
          following_count
        } = payload;

        return {
          __source,
          id,
          __createdAt: new Date(updated_at).getTime(),
          username,
          name: _name,
          portfolio_url,
          bio,
          location,
          link: links.html,
          profile_image: profile_image.large,
          total_collections,
          total_likes,
          total_photos,
          downloads,
          followers_count,
          following_count
        };
      }
      case "photos":
      case "likes": {
        return payload.map(
          ({
            id,
            created_at,
            updated_at,
            width,
            height,
            color,
            description,
            urls,
            links,
            likes
          }) => {
            return {
              __source,
              id,
              __createdAt: new Date(created_at).getTime(),
              updated_at: new Date(updated_at).getTime(),
              width,
              height,
              color,
              description,
              urls: {
                raw: urls.raw,
                small: urls.small
              },
              link: links.html,
              likes
            };
          }
        );
      }
      default: {
        return payload;
      }
    }
  }

  async profile({ page, per_page = this.perpage } = {}) {
    const source = { name: "unsplash", type: "profile", form: "staticitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = await this.client.get(`/users/${this.username}`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return { success: true, source, data: Unsplash.parser(source, r.data) };
  }

  async photos({ order_by, stats, resolution, quantity, page, per_page = this.perpage } = {}) {
    const source = { name: "unsplash", type: "photos", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
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
    return { success: true, source, data: Unsplash.parser(source, r.data) };
  }

  async likes({ order_by, page, per_page = this.perpage } = {}) {
    const source = { name: "unsplash", type: "likes", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = await this.client.get(`/users/${this.username}/likes`, {
      params: {
        ...(order_by && { order_by }),
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return { success: true, source, data: Unsplash.parser(source, r.data) };
  }

  async statistics({ resolution, quantity } = {}) {
    const source = { name: "unsplash", type: "statistics", form: "staticitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = await this.client.get(`/users/${this.username}/statistics`, {
      params: {
        ...(resolution && { resolution }),
        ...(quantity && { quantity })
      }
    });
    return { success: true, source, data: Unsplash.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "unsplash",
      type: "bucket",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = {
      profile: this.profile(),
      photos: this.photos(),
      likes: this.likes()
      // statistics: this.statistics()
    };
    let d = {
      profile: await r.profile,
      photos: await r.photos,
      likes: await r.likes
      // statistics: await r.statistics
    };
    return {
      success: true,
      source,
      data: {
        staticitems: {
          profile: d.profile.data
          // statistics: d.statistics.data
        },
        listitems: [...d.photos.data, ...d.likes.data]
      }
    };
  }
}

export default new Unsplash(UNSPLASH_USERNAME, UNSPLASH_ACCESS_KEY);
