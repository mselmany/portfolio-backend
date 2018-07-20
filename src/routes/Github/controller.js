import axios from "axios";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const API_URL = "https://api.github.com";
const STARRED_URL = `${API_URL}/users/${GITHUB_USERNAME}/starred`;
const WATCHERS_URL = `${API_URL}/users/${GITHUB_USERNAME}/subscriptions`;
const EVENTS_URL = `${API_URL}/users/${GITHUB_USERNAME}/events`;
const GISTS_URL = `${API_URL}/users/${GITHUB_USERNAME}/gists`;

export async function events({ page }) {
  return await axios.get(EVENTS_URL, {
    params: {
      ...(page && { page })
    }
  });
}

export async function watchers({ page }) {
  return await axios.get(WATCHERS_URL, {
    params: {
      ...(page && { page })
    }
  });
}

export async function stars({ page, per_page }) {
  return await axios.get(STARRED_URL, {
    params: {
      ...(page && { page }),
      ...(per_page && { per_page })
    }
  });
}

export async function gists({ page, per_page }) {
  return await axios.get(GISTS_URL, {
    params: {
      ...(page && { page }),
      ...(per_page && { per_page })
    }
  });
}
