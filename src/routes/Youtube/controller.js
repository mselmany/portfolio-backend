import { ApiBase, Utils } from "@/helpers";

const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const API_URL = "https://www.googleapis.com/youtube/v3";

class Youtube extends ApiBase {
  constructor(channel_id, api_key) {
    Utils.required({ channel_id, api_key });
    super(
      { baseURL: API_URL },
      {
        interceptor: config =>
          (config.params = { ...config.params, key: api_key })
      }
    );
    this.channel_id = channel_id;
    this.authorization = api_key;
  }

  static parser(type, payload) {
    if (!payload.items.length) {
      return {};
    }
    switch (type) {
      case "activities": {
        let { items, prevPageToken, nextPageToken, pageInfo } = payload;
        return {
          type,
          items: items.map(item => ({
            id: item.id,
            videoId: item.contentDetails.playlistItem.resourceId.videoId,
            channel: item.snippet.channelTitle,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnails: item.snippet.thumbnails
          })),
          pageInfo,
          ...(prevPageToken && { prevPageToken }),
          ...(nextPageToken && { nextPageToken })
        };
      }

      case "playlist": {
        let { items, prevPageToken, nextPageToken, pageInfo } = payload;
        return {
          type,
          items: items.map(item => ({
            id: item.id,
            videoId: item.contentDetails.videoId,
            channel: item.snippet.channelTitle,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnails: item.snippet.thumbnails
          })),
          pageInfo,
          ...(prevPageToken && { prevPageToken }),
          ...(nextPageToken && { nextPageToken })
        };
      }

      case "video": {
        let { id, statistics, snippet, contentDetails } = payload.items[0];
        return {
          type,
          id,
          resulation: contentDetails.definition,
          duration: contentDetails.duration,
          categoryId: snippet.categoryId,
          publishedAt: snippet.publishedAt,
          tags: snippet.tags,
          statistics
        };
      }

      default:
        return payload;
    }
  }

  async activities({
    limit = this.perpage,
    pageToken,
    publishedBefore,
    publishedAfter
  } = {}) {
    try {
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
      return {
        class: "youtube.activities",
        data: Youtube.parser("activities", r.data)
      };
    } catch (err) {
      this.error(err);
    }
  }

  async playlist({
    id,
    limit = this.perpage,
    pageToken,
    publishedBefore,
    publishedAfter
  } = {}) {
    try {
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
      return {
        class: "youtube.playlist",
        data: Youtube.parser("playlist", r.data)
      };
    } catch (err) {
      this.error(err);
    }
  }

  async video({ id, videoCategoryId } = {}) {
    try {
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
      return { class: "youtube.video", data: Youtube.parser("video", r.data) };
    } catch (err) {
      this.error(err);
    }
  }

  async _bundle() {
    try {
      let r = {
        activities: this.activities()
      };
      return {
        class: "youtube.bundle",
        data: {
          activities: await r.activities
        }
      };
    } catch (err) {
      this.error(err);
    }
  }
}

export default new Youtube(YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY);
