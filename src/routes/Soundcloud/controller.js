import { ApiBase, Utils } from "@/helpers";

const SOUNDCLOUD_USER_ID = process.env.SOUNDCLOUD_USER_ID;
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const API_URL = "https://api.soundcloud.com";

class Soundcloud extends ApiBase {
  constructor(user_id, client_id) {
    super(
      { baseURL: API_URL, init: { user_id, client_id } },
      {
        interceptor: config => (config.params = { ...config.params, client_id })
      }
    );
    this.user_id = user_id;
    this.client_id = client_id;
    this.authorization = client_id;
  }

  async user({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "soundcloud.user",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.user_id}`, {
      params: {
        ...(limit && { limit }),
        ...(linked_partitioning && { linked_partitioning })
      }
    });
    return { success: true, class: "soundcloud.user", data: r.data };
  }

  async playlists({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "soundcloud.playlists",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.user_id}/playlists`, {
      params: {
        ...(limit && { limit }),
        ...(linked_partitioning && { linked_partitioning })
      }
    });
    return {
      success: true,
      class: "soundcloud.playlists",
      data: r.data
    };
  }

  async comments({
    limit = this.perpage,
    linked_partitioning = 1,
    offset
  } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "soundcloud.comments",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.user_id}/comments`, {
      params: {
        ...(limit && { limit }),
        ...(linked_partitioning && { linked_partitioning }),
        ...(offset && { offset })
      }
    });
    return {
      success: true,
      class: "soundcloud.comments",
      data: r.data
    };
  }

  async favorites({
    limit = this.perpage,
    linked_partitioning = 1,
    cursor,
    page_size
  } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "soundcloud.favorites",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.user_id}/favorites`, {
      params: {
        ...(limit && { limit }),
        ...(linked_partitioning && { linked_partitioning }),
        ...(cursor && { cursor }),
        ...(page_size && { page_size })
      }
    });
    return { success: true, class: "soundcloud.favorites", data: r.data };
  }

  async tracks({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "soundcloud.tracks",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.user_id}/tracks`, {
      params: {
        ...(limit && { limit }),
        ...(linked_partitioning && { linked_partitioning })
      }
    });
    return {
      success: true,
      class: "soundcloud.tracks",
      data: r.data
    };
  }

  async track({ id } = {}) {
    if (!this.granted) {
      return {
        success: false,
        class: "soundcloud.track",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    this.required({ id });
    const r = await this.client.get(`/tracks/${id}`);
    return { success: true, class: "soundcloud.track", data: r.data };
  }

  async _bucket() {
    if (!this.granted) {
      return {
        success: false,
        class: "soundcloud.bucket",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = {
      user: this.user(),
      playlists: this.playlists(),
      comments: this.comments(),
      favorites: this.favorites(),
      tracks: this.tracks()
    };
    return {
      success: true,
      class: "soundcloud.bucket",
      data: {
        user: await r.user,
        playlists: await r.playlists,
        comments: await r.comments,
        favorites: await r.favorites,
        tracks: await r.tracks
      }
    };
  }
}

export default new Soundcloud(SOUNDCLOUD_USER_ID, SOUNDCLOUD_CLIENT_ID);
