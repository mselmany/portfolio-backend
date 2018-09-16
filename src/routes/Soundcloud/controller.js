import { ApiBase } from "@/helpers";

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

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }
    switch (type) {
      case "user": {
        let {
          id,
          username,
          permalink_url,
          avatar_url,
          country,
          city,
          full_name,
          description,
          track_count,
          playlist_count,
          public_favorites_count,
          followers_count,
          followings_count,
          reposts_count
        } = payload;

        return {
          __source: { name, type, form },
          id,
          username,
          permalink_url,
          avatar_url,
          country,
          city,
          full_name,
          description,
          track_count,
          playlist_count,
          public_favorites_count,
          followers_count,
          followings_count,
          reposts_count
        };
      }

      case "playlists": {
        let playlistsTracks = [];

        let playlists = payload.collection.map(item => {
          const {
            id,
            user_id,
            tracks,
            track_count,
            title,
            tag_list,
            permalink_url,
            artwork_url,
            created_at,
            last_modified,
            kind,
            genre,
            duration,
            description
          } = item;

          playlistsTracks = [...playlistsTracks, ...tracks];

          return {
            __source: { name, type, form: "staticitems" },
            id,
            user_id,
            track_count,
            title,
            tag_list,
            permalink_url,
            artwork_url,
            created_at,
            last_modified,
            kind,
            genre,
            duration,
            description
          };
        });

        let tracks = playlistsTracks.map(item => {
          const {
            id,
            kind,
            created_at,
            user_id,
            duration,
            tag_list,
            permalink_url,
            artwork_url,
            waveform_url,
            stream_url,
            playback_count,
            favoritings_count,
            comment_count,
            purchase_url,
            genre,
            title,
            description,
            label_name,
            original_format,
            user
          } = item;

          return {
            __source: { name, type, form: "listitems" },
            id,
            kind,
            created_at: new Date(created_at).getTime(),
            user_id,
            duration,
            tag_list,
            permalink_url,
            artwork_url,
            waveform_url,
            stream_url,
            playback_count,
            favoritings_count,
            comment_count,
            purchase_url,
            genre,
            title,
            description,
            label_name,
            original_format,
            user: {
              id: user.id,
              username: user.username,
              permalink_url: user.permalink_url,
              avatar_url: user.avatar_url
            }
          };
        });

        return {
          __source: { name, type, form: "staticitems|listitems" },
          staticitems: playlists,
          listitems: tracks
        };
      }

      case "comments": {
        return payload.collection.map(item => {
          const {
            id,
            kind,
            created_at,
            user_id,
            track_id,
            timestamp,
            body
          } = item;

          return {
            __source: { name, type, form },
            id,
            kind,
            created_at: new Date(created_at).getTime(),
            user_id,
            track_id,
            timestamp,
            body
          };
        });
      }

      case "favorites":
      case "tracks": {
        return payload.collection.map(item => {
          const {
            id,
            kind,
            created_at,
            user_id,
            duration,
            tag_list,
            permalink_url,
            artwork_url,
            waveform_url,
            stream_url,
            playback_count,
            favoritings_count,
            comment_count,
            purchase_url,
            genre,
            title,
            description,
            label_name,
            original_format,
            user
          } = item;

          return {
            __source: { name, type, form },
            id,
            kind,
            created_at: new Date(created_at).getTime(),
            user_id,
            duration,
            tag_list,
            permalink_url,
            artwork_url,
            waveform_url,
            stream_url,
            playback_count,
            favoritings_count,
            comment_count,
            purchase_url,
            genre,
            title,
            description,
            label_name,
            original_format,
            user: {
              id: user.id,
              username: user.username,
              permalink_url: user.permalink_url,
              avatar_url: user.avatar_url
            }
          };
        });
      }

      case "track": {
        const {
          id,
          kind,
          created_at,
          user_id,
          duration,
          tag_list,
          permalink_url,
          artwork_url,
          waveform_url,
          stream_url,
          playback_count,
          favoritings_count,
          comment_count,
          reposts_count,
          purchase_url,
          genre,
          title,
          description,
          label_name,
          original_format,
          user
        } = payload;

        return {
          __source: { name, type, form },
          id,
          kind,
          created_at: new Date(created_at).getTime(),
          user_id,
          duration,
          tag_list,
          permalink_url,
          artwork_url,
          waveform_url,
          stream_url,
          playback_count,
          favoritings_count,
          comment_count,
          reposts_count,
          purchase_url,
          genre,
          title,
          description,
          label_name,
          original_format,
          user: {
            id: user.id,
            username: user.username,
            permalink_url: user.permalink_url,
            avatar_url: user.avatar_url
          }
        };
      }

      default: {
        return payload;
      }
    }
  }

  async user({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    const source = { name: "soundcloud", type: "user", form: "staticitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/users/${this.user_id}`, {
      params: {
        ...(limit && { limit }),
        ...(linked_partitioning && { linked_partitioning })
      }
    });
    return { success: true, source, data: Soundcloud.parser(source, r.data) };
  }

  async playlists({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    const source = {
      name: "soundcloud",
      type: "playlists",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/users/${this.user_id}/playlists`, {
      params: {
        ...(limit && { limit }),
        ...(linked_partitioning && { linked_partitioning })
      }
    });
    return { success: true, source, data: Soundcloud.parser(source, r.data) };
  }

  async comments({
    limit = this.perpage,
    linked_partitioning = 1,
    offset
  } = {}) {
    const source = { name: "soundcloud", type: "comments", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/users/${this.user_id}/comments`, {
      params: {
        ...(limit && { limit }),
        ...(linked_partitioning && { linked_partitioning }),
        ...(offset && { offset })
      }
    });
    return { success: true, source, data: Soundcloud.parser(source, r.data) };
  }

  async favorites({
    limit = this.perpage,
    linked_partitioning = 1,
    cursor,
    page_size
  } = {}) {
    const source = { name: "soundcloud", type: "favorites", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/users/${this.user_id}/favorites`, {
      params: {
        ...(limit && { limit }),
        ...(linked_partitioning && { linked_partitioning }),
        ...(cursor && { cursor }),
        ...(page_size && { page_size })
      }
    });
    return { success: true, source, data: Soundcloud.parser(source, r.data) };
  }

  async tracks({ limit = this.perpage, linked_partitioning = 1 } = {}) {
    const source = { name: "soundcloud", type: "tracks", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/users/${this.user_id}/tracks`, {
      params: {
        ...(limit && { limit }),
        ...(linked_partitioning && { linked_partitioning })
      }
    });
    return { success: true, source, data: Soundcloud.parser(source, r.data) };
  }

  async track({ id } = {}) {
    const source = { name: "soundcloud", type: "track", form: "staticitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    this.required({ id });
    const r = await this.client.get(`/tracks/${id}`);
    return { success: true, source, data: Soundcloud.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "soundcloud",
      type: "bucket",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = {
      user: this.user(),
      playlists: this.playlists(),
      comments: this.comments(),
      favorites: this.favorites(),
      tracks: this.tracks()
    };
    let d = {
      user: await r.user,
      playlists: await r.playlists,
      comments: await r.comments,
      favorites: await r.favorites,
      tracks: await r.tracks
    };

    return {
      success: true,
      source,
      data: {
        staticitems: {
          user: d.user.data,
          playlists: d.playlists.data.staticitems
        },
        listitems: [
          ...d.tracks.data,
          ...d.favorites.data,
          ...d.comments.data,
          ...d.playlists.data.listitems
        ]
      }
    };
  }
}

export default new Soundcloud(SOUNDCLOUD_USER_ID, SOUNDCLOUD_CLIENT_ID);
