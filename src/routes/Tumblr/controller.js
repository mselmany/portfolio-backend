import { ApiBase, Utils } from "@/helpers";

const TUMBLR_BLOGNAME = process.env.TUMBLR_BLOGNAME;
const TUMBLR_CONSUMER_KEY = process.env.TUMBLR_CONSUMER_KEY;
const API_URL = "https://api.tumblr.com/v2";

class Tumblr extends ApiBase {
  constructor(blogname, consumer_key) {
    Utils.required({ blogname, consumer_key });
    super(
      { baseURL: API_URL },
      {
        interceptor: config =>
          (config.params = { ...config.params, api_key: consumer_key })
      }
    );
    this.blogname = blogname;
    this.consumer_key = consumer_key;
  }

  async bloginfo({ blogname = this.blogname } = {}) {
    try {
      let r = await this.client.get(`/blog/${blogname}/info`);
      r.data.response.blog.avatar = `${API_URL}/blog/${blogname}/avatar/512`;
      return { class: "tumblr.bloginfo", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }

  async likes({
    blogname = this.blogname,
    limit = this.perpage,
    offset,
    before,
    after
  } = {}) {
    try {
      let r = await this.client.get(`/blog/${blogname}/likes`, {
        params: {
          ...(limit && { limit }),
          ...(offset && { offset }),
          ...(before && { before }),
          ...(after && { after })
        }
      });
      return { class: "tumblr.likes", data: r.data };
    } catch (err) {
      this.error(err);
    }
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
    const _type = type ? `/${type}` : "";
    try {
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
      return { class: "tumblr.posts", data: r.data };
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Tumblr(TUMBLR_BLOGNAME, TUMBLR_CONSUMER_KEY);
