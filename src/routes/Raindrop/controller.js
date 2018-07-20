import axios from "axios";

const RAINDROP_COLLECTIONID = process.env.RAINDROP_COLLECTIONID;
const API_URL = "https://raindrop.io/v1";
const COLLECTION_URL = `${API_URL}/collection/${RAINDROP_COLLECTIONID}`;
const BOOKMARKS_URL = `${API_URL}/bookmarks/${RAINDROP_COLLECTIONID}`;
const BOOKMARK_URL = `${API_URL}/bookmark`;

export async function collection() {
  return await axios.get(COLLECTION_URL);
}

export async function bookmarks({ search, page, perpage, sort }) {
  return await axios.get(BOOKMARKS_URL, {
    params: {
      ...(search && { search }),
      ...(page && { page }),
      ...(perpage && { perpage }),
      ...(sort && { sort })
    }
  });
}

export async function bookmark({ id }) {
  return await axios.get(`${BOOKMARK_URL}/${id}`);
}
