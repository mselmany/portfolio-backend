import { ApiBase, Utils } from "@/helpers";

const TUMBLR_BLOGNAME = process.env.TUMBLR_BLOGNAME;
const TUMBLR_CONSUMER_KEY = process.env.TUMBLR_CONSUMER_KEY;
const TUMBLR_CONSUMER_SECRET = process.env.TUMBLR_CONSUMER_SECRET;
const API_URL = "https://api.tumblr.com/v2";

class Tumblr extends ApiBase {
  constructor(blogname, consumer_key, consumer_secret) {
    Utils.required({ blogname, consumer_key, consumer_secret });
    super(
      { baseURL: API_URL },
      {
        interceptor: config =>
          (config.params = { ...config.params, api_key: consumer_key })
      }
    );
    this.blogname = blogname;
    this.consumer_key = consumer_key;
    this.consumer_secret = consumer_secret;
  }

  async bloginfo({ blogname } = {}) {
    const _blogname = blogname || this.blogname;
    try {
      let r = await this.client.get(`/blog/${_blogname}/info`);
      r.data.response.blog.avatar = `${API_URL}/blog/${_blogname}/avatar/512`;
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }

  async likes({ blogname, limit = this.perpage, offset, before, after } = {}) {
    const _blogname = blogname || this.blogname;
    try {
      let r = await this.client.get(`/blog/${_blogname}/likes`, {
        params: {
          ...(limit && { limit }),
          ...(offset && { offset }),
          ...(before && { before }),
          ...(after && { after })
        }
      });
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }

  async posts({
    blogname,
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
    const _blogname = blogname || this.blogname;
    const _type = type ? `/${type}` : "";
    try {
      let r = await this.client.get(`/blog/${_blogname}/posts${_type}`, {
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
      return r.data;
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Tumblr(
  TUMBLR_BLOGNAME,
  TUMBLR_CONSUMER_KEY,
  TUMBLR_CONSUMER_SECRET
);
