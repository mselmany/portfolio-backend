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
    this.credentials = new Buffer(`${consumer_key}:${consumer_secret}`).toString("base64");
  }

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }
    switch (type) {
      case "timeline": {
        return payload.map(item => {
          return {
            __source: { name, type, form },
            ...generateItem(item)
          };
        });
      }

      default: {
        return payload;
      }
    }

    function generateItem({
      id_str,
      created_at,
      recreated_at = created_at,
      retweet_count,
      favorite_count,
      owner = true,
      user,
      retweeted_status = null,
      entities,
      extended_entities = null,
      text
    } = {}) {
      if (retweeted_status) {
        return generateItem({
          ...retweeted_status,
          owner: false,
          recreated_at: created_at
        });
      } else {
        let media;
        if (extended_entities) {
          entities = { ...entities, ...extended_entities };
        }

        if (entities.user_mentions && entities.user_mentions.length) {
          entities.user_mentions.forEach(({ screen_name, name }) => {
            text = text.replace(
              `@${screen_name}`,
              `<a href="https://twitter.com/${screen_name}" title="${name}">@${screen_name}</a>`
            );
          });
        }

        // search its last url index (for remove or not)
        const tweet_url_idx = text.lastIndexOf("https://t.co/");
        // if it exist
        if (tweet_url_idx > -1) {
          // extract it
          const tweet_url = text.substring(tweet_url_idx);
          // if tweet has url list
          if (entities.urls && entities.urls.length) {
            // then if it is same any of the url list
            const is_needed_url_exist = entities.urls.filter(({ url }) => tweet_url.includes(url));
            // then this means, it is not a tweet url(it is a some content url, exp: Soundcloud, etc.), so do not remove from "text"
            if (!is_needed_url_exist.length) {
              text = text.substring(0, tweet_url_idx - 1);
            }
          } else {
            text = text.substring(0, tweet_url_idx - 1);
          }
        }

        if (entities.urls && entities.urls.length) {
          // wrap urls with <a>
          entities.urls.forEach(({ url, expanded_url, display_url }) => {
            text = text.replace(url, `<a href="${expanded_url}">${display_url}</a>`);
          });
        }

        if (entities.media && entities.media.length) {
          media = entities.media.map(
            ({ id_str, media_url_https, url, display_url, type, video_info }) => {
              if (video_info) {
                let { aspect_ratio, duration_millis, variants } = video_info;

                video_info = {
                  aspect_ratio,
                  duration_millis,
                  source: variants
                    .filter(item => item.hasOwnProperty("bitrate"))
                    .sort((a, b) => b.bitrate - a.bitrate)[0]
                };
              }
              return {
                id_str,
                media_url_https,
                url,
                display_url,
                type,
                video_info
              };
            }
          );
        }

        return {
          id_str,
          owner,
          created_at,
          recreated_at,
          tweet_url: `https://twitter.com/${user.screen_name}/status/${id_str}`,
          text,
          media,
          retweet_count,
          favorite_count,
          user: generateUser(user)
        };
      }
    }

    function generateUser({
      id_str,
      name,
      screen_name,
      location,
      followers_count,
      friends_count,
      listed_count,
      created_at,
      favourites_count,
      verified,
      statuses_count,
      lang,
      profile_image_url_https,
      profile_banner_url,
      description,
      url,
      entities
    } = {}) {
      if (url && entities.url.urls.length) {
        const _urls = entities.url.urls[0];
        url = `<a href="${_urls.expanded_url}">${_urls.display_url}</a>`;
      }

      if (description && entities.description.urls.length) {
        entities.description.urls.forEach(({ url, expanded_url, display_url }) => {
          description = description.replace(url, `<a href="${expanded_url}">${display_url}</a>`);
        });
      }

      return {
        id_str,
        name,
        screen_name,
        location,
        followers_count,
        friends_count,
        listed_count,
        created_at,
        favourites_count,
        verified,
        statuses_count,
        lang,
        profile_image_url_https,
        profile_banner_url,
        url,
        description
      };
    }
  }

  async token() {
    const source = { name: "twitter", type: "token", form: "staticitems" };
    if (this.granted) {
      return {
        success: false,
        source,
        data: this.messages.ALREADY_EXIST
      };
    }
    const r = await this.client.post("/token", "grant_type=client_credentials", {
      baseURL: AUTH_URL,
      headers: {
        Authorization: `Basic ${this.credentials}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      }
    });
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
    await this.client.post("/invalidate_token", `access_token=${access_token}`, {
      baseURL: AUTH_URL,
      headers: {
        Authorization: `Basic ${this.credentials}`,
        "Content-Type": "application/x-www-form-urlencoded;"
      }
    });
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

  async likes({ user_id, since_id, count = this.perpage, max_id, include_rts } = {}) {
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
          (a, b) => b.recreated_at - a.recreated_at
        )
      }
    };
  }
}

export default new Twitter(TWITTER_USERNAME, TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET);
