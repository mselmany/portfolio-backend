import { ApiBase } from "@/helpers";

const YOUTUBE_PLAYLIST_ID = process.env.YOUTUBE_PLAYLIST_ID;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const API_URL = "https://www.googleapis.com/youtube/v3";

class Youtube extends ApiBase {
  constructor(channel_id, api_key) {
    super(
      { baseURL: API_URL, init: { channel_id, api_key } },
      {
        interceptor: config => (config.params = { ...config.params, key: api_key })
      }
    );
    this.channel_id = channel_id;
    this.playlist_id = YOUTUBE_PLAYLIST_ID;
    this.authorization = api_key;
  }

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }
    const __source = { name, type, form };
    switch (type) {
      case "activities": {
        return payload.items.map(
          ({
            id,
            contentDetails,
            snippet: {
              channelTitle,
              title,
              description,
              publishedAt,
              thumbnails: { medium, standard }
            }
          }) => {
            return {
              __source,
              id,
              videoId: contentDetails.playlistItem.resourceId.videoId,
              channel: channelTitle,
              title,
              // description,
              __createdAt: new Date(publishedAt).getTime(),
              thumbnails: standard || medium
            };
          }
        );
      }

      case "playlist": {
        return payload.items.map(
          ({
            id,
            contentDetails: { videoId },
            snippet: {
              channelTitle,
              title,
              description,
              publishedAt,
              thumbnails: { medium, standard }
            }
          }) => {
            return {
              __source,
              id,
              videoId,
              channel: channelTitle,
              title,
              // description,
              __createdAt: new Date(publishedAt).getTime(),
              thumbnails: standard || medium
            };
          }
        );
      }

      case "video": {
        let {
          id,
          statistics,
          snippet: { categoryId, publishedAt, tags },
          contentDetails: { definition, duration }
        } = payload.items[0];
        return {
          __source,
          id,
          resulation: definition,
          duration,
          categoryId,
          __createdAt: new Date(publishedAt).getTime(),
          tags,
          statistics
        };
      }

      default:
        return payload;
    }
  }

  async activities({ limit = this.perpage, pageToken, publishedBefore, publishedAfter } = {}) {
    const source = { name: "youtube", type: "activities", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get("/activities", {
      params: {
        channelId: this.channel_id,
        part: "snippet,contentDetails",
        fields:
          "etag,items(contentDetails,etag,id,kind,snippet(channelTitle,description,publishedAt,thumbnails(medium,standard),title,type)),kind,nextPageToken,pageInfo,prevPageToken,tokenPagination",
        maxResults: limit,
        ...(pageToken && { pageToken }),
        ...(publishedBefore && { publishedBefore }),
        ...(publishedAfter && { publishedAfter })
      }
    });
    return { success: true, source, data: Youtube.parser(source, r.data) };
  }

  async playlist({
    id = this.playlist_id,
    limit = this.perpage,
    pageToken,
    publishedBefore,
    publishedAfter
  } = {}) {
    const source = { name: "youtube", type: "playlist", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    this.required({ id });
    const r = await this.client.get("/playlistItems", {
      params: {
        channelId: this.channel_id,
        playlistId: id,
        part: "snippet,contentDetails",
        fields:
          "etag,items(contentDetails,etag,id,kind,snippet(channelTitle,description,publishedAt,thumbnails(medium,standard),title)),kind,nextPageToken,pageInfo,prevPageToken,tokenPagination",
        maxResults: limit,
        ...(pageToken && { pageToken }),
        ...(publishedBefore && { publishedBefore }),
        ...(publishedAfter && { publishedAfter })
      }
    });
    return { success: true, source, data: Youtube.parser(source, r.data) };
  }

  async video({ id, videoCategoryId } = {}) {
    const source = { name: "youtube", type: "video", form: "staticitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    this.required({ id });
    const r = await this.client.get("/videos", {
      params: {
        id,
        part: "snippet,contentDetails,statistics",
        fields:
          "items(contentDetails(definition,duration),id,snippet(categoryId,publishedAt,tags),statistics)",
        ...(videoCategoryId && { videoCategoryId })
      }
    });
    return { success: true, source, data: Youtube.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "youtube",
      type: "bucket",
      form: "listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = {
      activities: this.activities()
    };
    let d = {
      activities: await r.activities
    };
    return {
      success: true,
      source,
      data: {
        staticitems: {},
        listitems: [...d.activities.data]
      }
    };
  }
}

export default new Youtube(YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY);
