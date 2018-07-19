import axios from "axios";
import messages from "@/messages";

const AUTHORIZE_URL = "https://dribbble.com/oauth/authorize";
const TOKEN_URL = "https://dribbble.com/oauth/token";
const API_URL = "https://api.dribbble.com/v2";
const SHOTS_URL = `${API_URL}/user/shots`;
// const LIKES_URL = `${API_URL}/user/likes`;
const DRIBBBLE_CLIENT_ID = process.env.DRIBBBLE_CLIENT_ID;
const DRIBBBLE_CLIENT_SECRET = process.env.DRIBBBLE_CLIENT_SECRET;
const DRIBBBLE_REDIRECT_URL = process.env.DRIBBBLE_REDIRECT_URL;

export function authorize() {
  return `${AUTHORIZE_URL}?client_id=${DRIBBBLE_CLIENT_ID}&redirect_uri=${DRIBBBLE_REDIRECT_URL}`;
}

export async function token({ code, redirect_uri }) {
  if (!code) {
    throw new Error(`${messages.DATA_MISSING}: 'code'`);
  }
  return await axios.post(TOKEN_URL, {
    client_id: DRIBBBLE_CLIENT_ID,
    client_secret: DRIBBBLE_CLIENT_SECRET,
    code,
    ...(redirect_uri && { redirect_uri })
  });
}

export async function shots({ authorization, ...query }) {
  if (!authorization) {
    throw new Error(`${messages.DATA_MISSING}: 'authorization'`);
  }
  const { page, per_page } = query;
  return await axios.get(SHOTS_URL, {
    headers: {
      authorization
    },
    params: {
      ...(page && { page }),
      ...(per_page && { per_page })
    }
  });
}

// Bu endpoint sadece Dribbble tarafından onaylanmış uygulamalarda destekleniyor.
/* export async function likes({ authorization, ...query }) {
  if (!authorization) {
    throw new Error(`${messages.DATA_MISSING}: 'authorization'`);
  }
  const { page, per_page } = query;
  return await axios.get(LIKES_URL, {
    headers: {
      authorization
    },
    params: {
      ...(page && { page }),
      ...(per_page && { per_page })
    }
  });
} */
