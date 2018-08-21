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
    this.authorization = consumer_key;
  }

  async bloginfo({ blogname = this.blogname } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "tumblr.bloginfo",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = await this.client.get(`/blog/${blogname}/info`);
    r.data.response.blog.avatar = `${API_URL}/blog/${blogname}/avatar/512`;
    return { success: true, class: "tumblr.bloginfo", data: r.data };
  }

  async likes({
    blogname = this.blogname,
    limit = this.perpage,
    offset,
    before,
    after
  } = {}) {
    if (!this.isGranted) {
      return {
        success: false,
        class: "tumblr.likes",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = await this.client.get(`/blog/${blogname}/likes`, {
      params: {
        ...(limit && { limit }),
        ...(offset && { offset }),
        ...(before && { before }),
        ...(after && { after })
      }
    });
    return { success: true, class: "tumblr.likes", data: r.data };
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
    if (!this.isGranted) {
      return {
        success: false,
        class: "tumblr.posts",
        data: this.messages.NOT_AUTHORIZED
      };
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
    return { success: true, class: "tumblr.posts", data: r.data };
  }

  async _bucket() {
    if (!this.isGranted) {
      return {
        success: false,
        class: "tumblr.bucket",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = {
      bloginfo: this.bloginfo(),
      likes: this.likes(),
      posts: this.posts()
    };
    return {
      success: true,
      class: "tumblr.bucket",
      data: {
        bloginfo: await r.bloginfo,
        likes: await r.likes,
        posts: await r.posts
      }
    };
  }
}

export default new Tumblr(TUMBLR_BLOGNAME, TUMBLR_CONSUMER_KEY);
