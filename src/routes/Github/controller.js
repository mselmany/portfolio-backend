import axios from "axios";
import messages from "@/messages";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URL = process.env.GITHUB_REDIRECT_URL;
const GITHUB_SCOPE = "";
const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const API_URL = "https://api.github.com";
const STARRED_URL = `${API_URL}/users/${GITHUB_USERNAME}/starred`;
const WATCHERS_URL = `${API_URL}/users/${GITHUB_USERNAME}/subscriptions`;
const EVENTS_URL = `${API_URL}/users/${GITHUB_USERNAME}/events`;
const GISTS_URL = `${API_URL}/users/${GITHUB_USERNAME}/gists`;

export async function events({ ...query }) {
  const { page } = query;
  return await axios.get(EVENTS_URL, {
    params: {
      ...(page && { page })
    }
  });
}

export async function watchers({ ...query }) {
  const { page } = query;
  return await axios.get(WATCHERS_URL, {
    params: {
      ...(page && { page })
    }
  });
}

export async function stars({ ...query }) {
  const { page, per_page } = query;
  return await axios.get(STARRED_URL, {
    params: {
      ...(page && { page }),
      ...(per_page && { per_page })
    }
  });
}

export async function gists({ ...query }) {
  const { page, per_page } = query;
  return await axios.get(GISTS_URL, {
    params: {
      ...(page && { page }),
      ...(per_page && { per_page })
    }
  });
}
