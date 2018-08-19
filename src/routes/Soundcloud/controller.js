import { ApiBase, Utils } from "@/helpers";

const SOUNDCLOUD_USER_ID = process.env.SOUNDCLOUD_USER_ID;
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const API_URL = "https://api.soundcloud.com";

class Soundcloud extends ApiBase {
  constructor(user_id, client_id) {
    Utils.required({ user_id, client_id });
    super(
      { baseURL: API_URL },
      {
        interceptor: config => (config.params = { ...config.params, client_id })
      }
    );
    this.user_id = user_id;
    this.client_id = client_id;
    this.authorization = client_id;
  }

  async user({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    try {
      const r = await this.client.get(`/users/${this.user_id}`, {
        params: {
          ...(limit && { limit }),
          ...(linked_partitioning && { linked_partitioning })
        }
      });
      return { class: "soundcloud.user", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async playlists({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    try {
      const r = await this.client.get(`/users/${this.user_id}/playlists`, {
        params: {
          ...(limit && { limit }),
          ...(linked_partitioning && { linked_partitioning })
        }
      });
      return { class: "soundcloud.playlists", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async comments({
    limit = this.perpage,
    linked_partitioning = 1,
    offset
  } = {}) {
    try {
      const r = await this.client.get(`/users/${this.user_id}/comments`, {
        params: {
          ...(limit && { limit }),
          ...(linked_partitioning && { linked_partitioning }),
          ...(offset && { offset })
        }
      });
      return { class: "soundcloud.comments", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async favorites({
    limit = this.perpage,
    linked_partitioning = 1,
    cursor,
    page_size
  } = {}) {
    try {
      const r = await this.client.get(`/users/${this.user_id}/favorites`, {
        params: {
          ...(limit && { limit }),
          ...(linked_partitioning && { linked_partitioning }),
          ...(cursor && { cursor }),
          ...(page_size && { page_size })
        }
      });
      return { class: "soundcloud.favorites", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async tracks({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    try {
      const r = await this.client.get(`/users/${this.user_id}/tracks`, {
        params: {
          ...(limit && { limit }),
          ...(linked_partitioning && { linked_partitioning })
        }
      });
      return { class: "soundcloud.tracks", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async track({ id } = {}) {
    try {
      this.required({ id });
      const r = await this.client.get(`/tracks/${id}`);
      return { class: "soundcloud.track", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async _bundle() {
    try {
      let r = {
        user: this.user(),
        playlists: this.playlists(),
        comments: this.comments(),
        favorites: this.favorites(),
        tracks: this.tracks()
      };
      return {
        class: "soundcloud.bundle",
        data: {
          user: await r.user,
          playlists: await r.playlists,
          comments: await r.comments,
          favorites: await r.favorites,
          tracks: await r.tracks
        }
      };
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Soundcloud(SOUNDCLOUD_USER_ID, SOUNDCLOUD_CLIENT_ID);
