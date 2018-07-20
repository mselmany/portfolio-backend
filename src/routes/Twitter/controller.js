import axios from "axios";
import messages from "@/messages";

const TWITTER_USERNAME = process.env.TWITTER_USERNAME;
const API_URL = "https://api.twitter.com/1.1";
const TOKEN_URL = "https://api.twitter.com/oauth2/token";
const INVALIDATE_TOKEN_URL = "https://api.twitter.com/oauth2/invalidate_token";
const TIMELINE_URL = `${API_URL}/statuses/user_timeline.json`;
const LIKES_URL = `${API_URL}/favorites/list.json`;

function credentials() {
  return new Buffer(
    process.env.TWITTER_COMSUMER_KEY + ":" + process.env.TWITTER_COMSUMER_SECRET
  ).toString("base64");
}

export async function token() {
  return await axios.post(TOKEN_URL, "grant_type=client_credentials", {
    headers: {
      Authorization: `Basic ${credentials()}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    }
  });
}

export async function invalidateToken({ access_token }) {
  return await axios.post(
    INVALIDATE_TOKEN_URL,
    `access_token=${access_token}`,
    {
      headers: {
        Authorization: `Basic ${credentials()}`,
        "Content-Type": "application/x-www-form-urlencoded;"
      }
    }
  );
}

export async function timeline({
  authorization,
  user_id,
  since_id,
  count,
  max_id,
  trim_user,
  exclude_replies,
  include_rts
}) {
  return await axios.get(TIMELINE_URL, {
    headers: {
      authorization
    },
    params: {
      screen_name: TWITTER_USERNAME,
      ...(user_id && { user_id }),
      ...(since_id && { since_id }),
      ...(count && { count }),
      ...(max_id && { max_id }),
      ...(trim_user && { trim_user }),
      ...(exclude_replies && { exclude_replies }),
      ...(include_rts && { include_rts })
    }
  });
}

export async function likes({
  authorization,
  user_id,
  since_id,
  count,
  max_id,
  include_rts
}) {
  return await axios.get(LIKES_URL, {
    headers: {
      authorization
    },
    params: {
      screen_name: TWITTER_USERNAME,
      ...(user_id && { user_id }),
      ...(since_id && { since_id }),
      ...(count && { count }),
      ...(max_id && { max_id }),
      ...(include_rts && { include_rts })
    }
  });
}
