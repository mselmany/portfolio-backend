import { ApiBase } from "@/helpers";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const API_URL = "https://api.instagram.com/v1";
const AUTH_URL = "https://api.instagram.com/oauth";

class Instagram extends ApiBase {
  constructor(client_id, client_secret) {
    super({ baseURL: API_URL, init: { client_id, client_secret } });
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.redirect_uri;
  }

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }
    switch (type) {
      case "user": {
        payload.data.__source = { name, type, form };
        return payload.data;
      }

      case "media": {
        return payload.data.map(_item => {
          const {
            id,
            created_time,
            caption,
            likes,
            comments,
            tags,
            link,
            location,
            filter,
            users_in_photo,
            images,
            videos,
            carousel_media
          } = _item;

          let media = [];
          switch (_item.type) {
            case "carousel": {
              media = carousel_media.map(it => {
                return {
                  type: it.type,
                  content:
                    it[it.type === "video" ? "videos" : "images"]
                      .standard_resolution.url
                };
              });
              break;
            }

            case "image": {
              media = [
                { type: _item.type, content: images.standard_resolution.url }
              ];
              break;
            }

            case "video": {
              media = [
                { type: _item.type, content: videos.standard_resolution.url }
              ];
              break;
            }

            default:
              break;
          }

          return {
            __source: { name, type, form },
            id,
            created_time,
            text: caption && caption.text,
            likes: likes.count,
            comments: comments.count,
            tags,
            link,
            location: location && location.name,
            filter,
            users_in_photo: users_in_photo.map(it => it.user.username),
            media
          };
        });
      }

      default:
        return payload;
    }
  }

  authorize({ redirect_uri } = {}) {
    this.required({ redirect_uri });
    this.redirect_uri = redirect_uri;
    const data = Object.entries({
      client_id: this.client_id,
      response_type: "code",
      scope: "basic+public_content",
      redirect_uri
    })
      .map(pair => `${pair[0]}=${pair[1]}`)
      .join("&");
    return `${AUTH_URL}/authorize?${data}`;
  }

  // have to be redirect via authorize({ redirect_uri })
  async token({ code } = {}) {
    if (this.granted) {
      return {
        success: false,
        class: "instagram.token",
        data: this.messages.ALREADY_EXIST
      };
    }
    this.required({ code });
    const data = Object.entries({
      client_id: this.client_id,
      client_secret: this.client_secret,
      grant_type: "authorization_code",
      code,
      redirect_uri: this.redirect_uri
    })
      .map(pair => `${pair[0]}=${pair[1]}`)
      .join("&");

    const r = await this.client.post("/access_token", `${data}`, {
      baseURL: AUTH_URL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    this.authorization = r.data.access_token;
    return {
      success: true,
      class: "instagram.token",
      data: this.messages.ACCESS_GRANTED
    };
  }

  async user() {
    const source = { name: "instagram", type: "user", form: "staticitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    this.required({ authorization: this.authorization });
    const r = await this.client.get("/users/self", {
      params: {
        access_token: this.authorization
      }
    });
    return {
      success: true,
      source,
      data: Instagram.parser(source, r.data)
    };
  }

  async media({ min_id, max_id, count = this.perpage } = {}) {
    const source = { name: "instagram", type: "media", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    this.required({ authorization: this.authorization });
    const r = await this.client.get("/users/self/media/recent", {
      params: {
        access_token: this.authorization,
        ...(min_id && { min_id }),
        ...(max_id && { max_id }),
        ...(count && { count })
      }
    });
    return { success: true, source, data: Instagram.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "instagram",
      type: "bucket",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = { user: this.user(), media: this.media() };
    let d = { user: await r.user, media: await r.media };

    return {
      success: true,
      source,
      data: { staticitems: d.user.data, listitems: d.media.data }
    };
  }
}

export default new Instagram(INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET);
