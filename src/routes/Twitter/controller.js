import { ApiBase } from "@/helpers";

const TWITTER_USERNAME = process.env.TWITTER_USERNAME;
const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
const API_URL = "https://api.twitter.com/1.1";
const AUTH_URL = "https://api.twitter.com/oauth2";

class Twitter extends ApiBase {
  constructor(username, consumer_key, consumer_secret) {
    super({
      baseURL: API_URL,
      init: { username, consumer_key, consumer_secret }
    });
    this.username = username;
    this.credentials = new Buffer(
      `${consumer_key}:${consumer_secret}`
    ).toString("base64");
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

  async token() {
    const source = { name: "twitter", type: "token", form: "staticitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.post(
      "/token",
      "grant_type=client_credentials",
      {
        baseURL: AUTH_URL,
        headers: {
          Authorization: `Basic ${this.credentials}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        }
      }
    );
    const { token_type, access_token } = r.data;
    this.authorization = `${token_type} ${access_token}`;
    return { success: true, source, data: this.messages.ACCESS_GRANTED };
  }

  async refreshToken({ access_token } = {}) {
    const source = {
      name: "twitter",
      type: "refreshToken",
      form: "staticitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    this.required({ access_token });
    await this.client.post(
      "/invalidate_token",
      `access_token=${access_token}`,
      {
        baseURL: AUTH_URL,
        headers: {
          Authorization: `Basic ${this.credentials}`,
          "Content-Type": "application/x-www-form-urlencoded;"
        }
      }
    );
    await this.token();
    return { success: true, source, data: this.messages.ACCESS_GRANTED };
  }

  async timeline({
    user_id,
    since_id,
    count = this.perpage,
    max_id,
    trim_user,
    exclude_replies,
    include_rts
  } = {}) {
    const source = { name: "twitter", type: "timeline", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get("/statuses/user_timeline.json", {
      headers: {
        authorization: this.authorization
      },
      params: {
        screen_name: this.username,
        ...(user_id && { user_id }),
        ...(since_id && { since_id }),
        ...(count && { count }),
        ...(max_id && { max_id }),
        ...(trim_user && { trim_user }),
        ...(exclude_replies && { exclude_replies }),
        ...(include_rts && { include_rts })
      }
    });
    return { success: true, source, data: Twitter.parser(source, r.data) };
  }

  async likes({
    user_id,
    since_id,
    count = this.perpage,
    max_id,
    include_rts
  } = {}) {
    const source = { name: "twitter", type: "likes", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get("/favorites/list.json", {
      headers: {
        authorization: this.authorization
      },
      params: {
        screen_name: this.username,
        ...(user_id && { user_id }),
        ...(since_id && { since_id }),
        ...(count && { count }),
        ...(max_id && { max_id }),
        ...(include_rts && { include_rts })
      }
    });
    return { success: true, source, data: Twitter.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "twitter",
      type: "bucket",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = { timeline: this.timeline(), likes: this.likes() };
    let d = {
      timeline: await r.timeline,
      likes: await r.likes
    };

    return {
      success: true,
      source,
      data: {
        staticitems: {},
        listitems: [...d.timeline.data, ...d.likes.data].sort(
          (a, b) => b.created_at - a.created_at
        )
      }
    };
  }
}

export default new Twitter(
  TWITTER_USERNAME,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET
);
