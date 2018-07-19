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
// const STARRED_URL = `${API_URL}/user/starred`;
const STARRED_URL = `${API_URL}/users/${GITHUB_USERNAME}/starred`;
const EVENTS_URL = `${API_URL}/users/${GITHUB_USERNAME}/events/public`;

export function authorize() {
  return `${AUTHORIZE_URL}?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URL}&scope=${GITHUB_SCOPE}&allow_signup=true`;
}

export async function token({ code, state, redirect_uri }) {
  if (!code) {
    throw new Error(`${messages.DATA_MISSING}: 'code'`);
  }
  return await axios.post(
    TOKEN_URL,
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      ...(state && { state }),
      ...(redirect_uri && { redirect_uri })
    },
    {
      headers: { Accept: "application/json" }
    }
  );
}

export async function events({ authorization, ...query }) {
  /* if (!authorization) {
    throw new Error(`${messages.DATA_MISSING}: 'authorization'`);
  } */
  const { page } = query;
  return await axios.get(EVENTS_URL, {
    /* headers: {
      authorization
    }, */
    params: {
      ...(page && { page })
    }
  });
}

export async function stars({ authorization, ...query }) {
  /* if (!authorization) {
    throw new Error(`${messages.DATA_MISSING}: 'authorization'`);
  } */
  const { page, per_page } = query;
  return await axios.get(STARRED_URL, {
    /* headers: {
      authorization
    }, */
    params: {
      ...(page && { page }),
      ...(per_page && { per_page })
    }
  });
}
