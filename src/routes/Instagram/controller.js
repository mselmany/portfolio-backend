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
  }

  async user({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    try {
      return await this.client.get(`/users/${this.user_id}`, {
        params: {
          ...(limit && { limit }),
          ...(linked_partitioning && { linked_partitioning })
        }
      });
    } catch (err) {
      this.error(err);
    }
  }

  async playlists({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    try {
      return await this.client.get(`/users/${this.user_id}/playlists`, {
        params: {
          ...(limit && { limit }),
          ...(linked_partitioning && { linked_partitioning })
        }
      });
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
      return await this.client.get(`/users/${this.user_id}/comments`, {
        params: {
          ...(limit && { limit }),
          ...(linked_partitioning && { linked_partitioning }),
          ...(offset && { offset })
        }
      });
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
      return await this.client.get(`/users/${this.user_id}/favorites`, {
        params: {
          ...(limit && { limit }),
          ...(linked_partitioning && { linked_partitioning }),
          ...(cursor && { cursor }),
          ...(page_size && { page_size })
        }
      });
    } catch (err) {
      this.error(err);
    }
  }

  async tracks({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    try {
      return await this.client.get(`/users/${this.user_id}/tracks`, {
        params: {
          ...(limit && { limit }),
          ...(linked_partitioning && { linked_partitioning })
        }
      });
    } catch (err) {
      this.error(err);
    }
  }

  async track({ id } = {}) {
    try {
      this.required({ id });
      return await this.client.get(`/tracks/${id}`);
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Soundcloud(SOUNDCLOUD_USER_ID, SOUNDCLOUD_CLIENT_ID);