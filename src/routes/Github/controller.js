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
    switch (type) {
      case "user": {
        var _item = payload;
        return {
          __source: { name, type, form },
          id: _item.id,
          name: _item.name,
          login: _item.login,
          avatar_url: _item.avatar_url,
          bio: _item.bio,
          created_at: _item.created_at,
          updated_at: _item.updated_at,
          followers: _item.followers,
          following: _item.following,
          location: _item.location,
          public_gists: _item.public_gists,
          public_repos: _item.public_repos,
          html_url: _item.html_url
        };
      }

      case "events": {
        return payload.map(_item => ({
          __source: {
            name,
            type,
            form
          },
          id: _item.id,
          type: _item.type,
          created_at: _item.created_at,
          action: _item.payload.action,
          repo: _item.repo,
          actor: {
            id: _item.actor.id,
            login: _item.actor.login,
            avatar_url: _item.actor.avatar_url
          }
        }));
      }

      case "watchers": {
        return payload.map(_item => ({
          __source: {
            name,
            type,
            form
          },
          id: _item.id,
          name: _item.name,
          full_name: _item.full_name,
          html_url: _item.html_url,
          description: _item.description,
          created_at: _item.created_at,
          updated_at: _item.updated_at,
          pushed_at: _item.pushed_at,
          homepage: _item.homepage,
          stargazers_count: _item.stargazers_count,
          watchers_count: _item.watchers_count,
          forks_count: _item.forks_count,
          language: _item.language,
          owner: {
            id: _item.owner.id,
            login: _item.owner.login,
            avatar_url: _item.owner.avatar_url
          }
        }));
      }

      case "stars": {
        return payload.map(_item => ({
          __source: {
            name,
            type,
            form
          },
          id: _item.id,
          name: _item.name,
          full_name: _item.full_name,
          html_url: _item.html_url,
          description: _item.description,
          created_at: _item.created_at,
          updated_at: _item.updated_at,
          pushed_at: _item.pushed_at,
          homepage: _item.homepage,
          stargazers_count: _item.stargazers_count,
          watchers_count: _item.watchers_count,
          forks_count: _item.forks_count,
          language: _item.language,
          owner: {
            id: _item.owner.id,
            login: _item.owner.login,
            avatar_url: _item.owner.avatar_url
          }
        }));
      }

      case "gists": {
        return payload.map(_item => ({
          __source: {
            name,
            type,
            form
          },
          id: _item.id,
          html_url: _item.html_url,
          created_at: _item.created_at,
          updated_at: _item.updated_at,
          description: _item.description,
          comments: _item.comments,
          files: Object.keys(_item.files),
          owner: {
            id: _item.owner.id,
            login: _item.owner.login,
            avatar_url: _item.owner.avatar_url
          }
        }));
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
        staticitems: d.user.data,
        listitems: [
          ...d.events.data,
          ...d.watchers.data,
          ...d.gists.data,
          ...d.stars.data
        ]
      }
    };
  }
}

export default new Github(GITHUB_USERNAME);
