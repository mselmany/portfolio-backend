import { ApiBase } from "@/helpers";

const TUMBLR_BLOGNAME = process.env.TUMBLR_BLOGNAME;
const TUMBLR_CONSUMER_KEY = process.env.TUMBLR_CONSUMER_KEY;
const API_URL = "https://api.tumblr.com/v2";

class Tumblr extends ApiBase {
  constructor(blogname, consumer_key) {
    super(
      { baseURL: API_URL, init: { blogname, consumer_key } },
      {
        interceptor: config =>
          (config.params = { ...config.params, api_key: consumer_key })
      }
    );
    this.blogname = blogname;
    this.consumer_key = consumer_key;
    this.authorization = consumer_key;
  }

  // TODO@1 : tumblr parser i diğerleri gibi yapılacak...
  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }
    const __source = { name, type, form };
    switch (type) {
      case "bloginfo": {
        let {
          name,
          title,
          description,
          posts,
          likes,
          url,
          avatar
        } = payload.response.blog;
        return {
          __source,
          name,
          title,
          description,
          posts,
          likes,
          url,
          avatar
        };
      }

      case "likes": {
        return payload.response.liked_posts.map(
          ({
            type,
            blog,
            id,
            post_url,
            date,
            timestamp,
            tags,
            summary,
            note_count,
            caption,
            image_permalink,
            photos
          }) => {
            return {
              __source,
              id,
              kind,
              created_at: new Date(created_at).getTime(),
              user_id,
              track_id,
              timestamp,
              body
            };
          }
        );
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

  async bloginfo({ blogname = this.blogname } = {}) {
    const source = { name: "tumblr", type: "bloginfo", form: "staticitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = await this.client.get(`/blog/${blogname}/info`);
    r.data.response.blog.avatar = `${API_URL}/blog/${blogname}/avatar/512`;
    return { success: true, source, data: Tumblr.parser(source, r.data) };
  }

  async likes({
    blogname = this.blogname,
    limit = this.perpage,
    offset,
    before,
    after
  } = {}) {
    const source = { name: "tumblr", type: "likes", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = await this.client.get(`/blog/${blogname}/likes`, {
      params: {
        ...(limit && { limit }),
        ...(offset && { offset }),
        ...(before && { before }),
        ...(after && { after })
      }
    });
    return { success: true, source, data: Tumblr.parser(source, r.data) };
  }

  async posts({
    blogname = this.blogname,
    type,
    id,
    tag,
    reblog_info,
    notes_info,
    filter = "text",
    limit = this.perpage,
    offset,
    before
  } = {}) {
    const source = { name: "tumblr", type: "posts", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const _type = type ? `/${type}` : "";
    let r = await this.client.get(`/blog/${blogname}/posts${_type}`, {
      params: {
        ...(id && { id }),
        ...(tag && { tag }),
        ...(reblog_info && { reblog_info }),
        ...(notes_info && { notes_info }),
        ...(filter && { filter }),
        ...(limit && { limit }),
        ...(offset && { offset }),
        ...(before && { before })
      }
    });
    return { success: true, source, data: Tumblr.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "tumblr",
      type: "bucket",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = {
      bloginfo: this.bloginfo(),
      likes: this.likes(),
      posts: this.posts()
    };
    let d = {
      bloginfo: await r.bloginfo,
      likes: await r.likes,
      posts: await r.posts
    };

    return {
      success: true,
      source,
      data: {
        staticitems: { bloginfo: d.bloginfo.data },
        listitems: [...d.likes.data, ...d.posts.data]
      }
    };
  }
}

export default new Tumblr(TUMBLR_BLOGNAME, TUMBLR_CONSUMER_KEY);
