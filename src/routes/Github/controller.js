import { ApiBase } from "@/helpers";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const API_URL = "https://api.github.com";

class Github extends ApiBase {
  constructor(username) {
    super({ baseURL: API_URL, init: { username } });
    this.username = username;
    this.authorization = true;
  }

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }

    const __source = { name, type, form };

    switch (type) {
      case "user": {
        var {
          id,
          name,
          login,
          avatar_url,
          bio,
          created_at,
          updated_at,
          followers,
          following,
          location,
          public_gists,
          public_repos,
          html_url
        } = payload;
        return {
          __source,
          id,
          name,
          login,
          avatar_url,
          bio,
          __createdAt: new Date(created_at).getTime(),
          updated_at: new Date(updated_at).getTime(),
          followers,
          following,
          location,
          public_gists,
          public_repos,
          html_url
        };
      }

      case "events": {
        return payload.map(
          ({ id, type, created_at, action, repo, actor: { id: _id, login, avatar_url } }) => ({
            __source,
            id,
            type,
            __createdAt: new Date(created_at).getTime(),
            action,
            repo,
            actor: { id: _id, login, avatar_url }
          })
        );
      }

      case "watchers": {
        return payload.map(
          ({
            id,
            name,
            full_name,
            html_url,
            description,
            created_at,
            updated_at,
            pushed_at,
            homepage,
            stargazers_count,
            watchers_count,
            forks_count,
            language,
            owner: { id: _id, login, avatar_url }
          }) => ({
            __source,
            id,
            name,
            full_name,
            html_url,
            description,
            __createdAt: new Date(created_at).getTime(),
            updated_at: new Date(updated_at).getTime(),
            pushed_at: new Date(pushed_at).getTime(),
            homepage,
            stargazers_count,
            watchers_count,
            forks_count,
            language,
            owner: { id: _id, login, avatar_url }
          })
        );
      }

      case "stars": {
        return payload.map(
          ({
            id,
            name,
            full_name,
            html_url,
            description,
            created_at,
            updated_at,
            pushed_at,
            homepage,
            stargazers_count,
            watchers_count,
            forks_count,
            language,
            owner: { id: _id, login, avatar_url }
          }) => ({
            __source,
            id,
            name,
            full_name,
            html_url,
            description,
            __createdAt: new Date(created_at).getTime(),
            updated_at: new Date(updated_at).getTime(),
            pushed_at: new Date(pushed_at).getTime(),
            homepage,
            stargazers_count,
            watchers_count,
            forks_count,
            language,
            owner: { id: _id, login, avatar_url }
          })
        );
      }

      case "gists": {
        return payload.map(
          ({
            id,
            html_url,
            created_at,
            updated_at,
            description,
            comments,
            files,
            owner: { id: _id, login, avatar_url }
          }) => ({
            __source,
            id,
            html_url,
            __createdAt: new Date(created_at).getTime(),
            updated_at: new Date(updated_at).getTime(),
            description,
            comments,
            files: Object.keys(files),
            owner: { id: _id, login, avatar_url }
          })
        );
      }

      default:
        return payload;
    }
  }

  async user() {
    const source = {
      name: "github",
      type: "user",
      form: "staticitems"
    };
    if (!this.granted) {
      return {
        success: false,
        source,
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.username}`);
    return {
      success: true,
      source,
      data: Github.parser(source, r.data)
    };
  }

  async events({ page, per_page = this.perpage } = {}) {
    const source = {
      name: "github",
      type: "events",
      form: "listitems"
    };
    if (!this.granted) {
      return {
        success: false,
        source,
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.username}/events`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return {
      success: true,
      source,
      data: Github.parser(source, r.data)
    };
  }

  async watchers({ page, per_page = this.perpage } = {}) {
    const source = {
      name: "github",
      type: "watchers",
      form: "listitems"
    };
    if (!this.granted) {
      return {
        success: false,
        source,
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/users/${this.username}/subscriptions`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return {
      success: true,
      source,
      data: Github.parser(source, r.data)
    };
  }

  async stars({ page, per_page = this.perpage } = {}) {
    const source = { name: "github", type: "stars", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/users/${this.username}/starred`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return { success: true, source, data: Github.parser(source, r.data) };
  }

  async gists({ page, per_page = this.perpage } = {}) {
    const source = { name: "github", type: "gists", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/users/${this.username}/gists`, {
      params: {
        ...(page && { page }),
        ...(per_page && { per_page })
      }
    });
    return { success: true, source, data: Github.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "github",
      type: "bucket",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }

    let r = {
      user: this.user(),
      events: this.events(),
      watchers: this.watchers(),
      stars: this.stars(),
      gists: this.gists()
    };
    let d = {
      user: await r.user,
      events: await r.events,
      watchers: await r.watchers,
      stars: await r.stars,
      gists: await r.gists
    };

    return {
      success: true,
      source,
      data: {
        staticitems: { user: d.user.data },
        listitems: [...d.events.data, ...d.watchers.data, ...d.gists.data, ...d.stars.data]
      }
    };
  }
}

export default new Github(GITHUB_USERNAME);
