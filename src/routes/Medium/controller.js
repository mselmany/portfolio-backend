import { ApiBase } from "@/helpers";

const MEDIUM_USERNAME = process.env.MEDIUM_USERNAME;
const API_URL = "https://medium.com/@";
const PROFILE_IMAGE_BASE_URL = "https://miro.medium.com/fit/c/240/240/";
const CONTENT_IMAGE_BASE_URL = "https://cdn-images-1.medium.com/max/1600/";

class Medium extends ApiBase {
  constructor(username) {
    super(
      { baseURL: API_URL + username, init: { username } },
      {
        interceptor: config => (config.params = { ...config.params, format: "json" })
      }
    );
    this.username = username;
    this.authorization = true;
  }

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }

    const __source = { name, type, form };

    try {
      var data = JSON.parse(payload.replace("])}while(1);</x>", ""));
    } catch (err) {
      return [];
    }
    switch (type) {
      case "user": {
        let {
          user: { userId, name, username, imageId, bio },
          userMeta: { numberOfPostsPublished },
          references: { SocialStats }
        } = data.payload;

        const { usersFollowedCount, usersFollowedByCount } = SocialStats[userId];

        return {
          __source,
          userId,
          name,
          username,
          imageId: PROFILE_IMAGE_BASE_URL + imageId,
          bio,
          url: API_URL + username,
          usersFollowedCount,
          usersFollowedByCount,
          numberOfPostsPublished
        };
      }

      case "latest": {
        let { Post, User } = data.payload.references;
        return Object.values(Post).map(
          ({
            id,
            title,
            createdAt,
            creatorId,
            uniqueSlug,
            virtuals: {
              subtitle,
              previewImage: { imageId },
              readingTime,
              recommends,
              totalClapCount,
              responsesCreatedCount
            }
          }) => {
            const _creator = User[creatorId];
            const url = API_URL + _creator.username;
            return {
              __source,
              id,
              title,
              url: `${url}/${uniqueSlug}`,
              __createdAt: createdAt,
              subtitle,
              imageId: imageId && CONTENT_IMAGE_BASE_URL + imageId,
              readingTime,
              recommends,
              totalClapCount,
              responsesCreatedCount,
              creator: {
                id: creatorId,
                name: _creator.name,
                username: _creator.username,
                imageId: PROFILE_IMAGE_BASE_URL + _creator.imageId,
                bio: _creator.bio,
                url
              }
            };
          }
        );
      }

      case "recommended": {
        let { Post, User } = data.payload.references;
        return Object.values(Post).map(
          ({
            id,
            title,
            createdAt,
            creatorId,
            uniqueSlug,
            virtuals: {
              subtitle,
              previewImage: { imageId },
              readingTime,
              recommends,
              totalClapCount,
              responsesCreatedCount
            }
          }) => {
            const _creator = User[creatorId];
            const url = API_URL + _creator.username;
            return {
              __source,
              id,
              title,
              url: `${url}/${uniqueSlug}`,
              __createdAt: createdAt,
              subtitle,
              imageId: imageId && CONTENT_IMAGE_BASE_URL + imageId,
              readingTime,
              recommends,
              totalClapCount,
              responsesCreatedCount,
              creator: {
                id: creatorId,
                name: _creator.name,
                username: _creator.username,
                imageId: PROFILE_IMAGE_BASE_URL + _creator.imageId,
                bio: _creator.bio,
                url
              }
            };
          }
        );
      }

      case "responses": {
        let { user, references } = data.payload;
        let { Post, User } = references;
        return Object.values(Post)
          .filter(item => item.creatorId === user.userId)
          .map(
            ({
              id,
              inResponseToPostId,
              createdAt,
              creatorId,
              uniqueSlug,
              virtuals: { readingTime, recommends, totalClapCount, responsesCreatedCount },
              previewContent
            }) => {
              const text = previewContent.bodyModel.paragraphs.map(p => p.text);
              const _creator = User[creatorId];
              const url = API_URL + _creator.username;

              const _refPost = Post[inResponseToPostId];
              const _refPostCreator = User[_refPost.creatorId];
              const _refPostCreatorUrl = API_URL + _refPostCreator.username;

              const refPost = {
                id: _refPost.id,
                title: _refPost.title,
                url: `${_refPostCreatorUrl}/${_refPost.uniqueSlug}`,
                createdAt: _refPost.createdAt,
                subtitle: _refPost.virtuals.subtitle,
                imageId:
                  _refPost.virtuals.previewImage.imageId &&
                  CONTENT_IMAGE_BASE_URL + _refPost.virtuals.previewImage.imageId,
                readingTime: _refPost.virtuals.readingTime,
                recommends: _refPost.virtuals.recommends,
                totalClapCount: _refPost.virtuals.totalClapCount,
                responsesCreatedCount: _refPost.virtuals.responsesCreatedCount,
                creator: {
                  id: _refPost.creatorId,
                  name: _refPostCreator.name,
                  username: _refPostCreator.username,
                  imageId: PROFILE_IMAGE_BASE_URL + _refPostCreator.imageId,
                  bio: _refPostCreator.bio,
                  url: _refPostCreatorUrl
                }
              };

              return {
                __source,
                id,
                url: `${url}/${uniqueSlug}`,
                __createdAt: createdAt,
                readingTime,
                recommends,
                totalClapCount,
                responsesCreatedCount,
                refPost,
                text,
                creator: {
                  id: creatorId,
                  name: _creator.name,
                  username: _creator.username,
                  imageId: PROFILE_IMAGE_BASE_URL + _creator.imageId,
                  bio: _creator.bio,
                  url
                }
              };
            }
          );
      }

      case "highlights": {
        const { Quote, User, Post } = data.payload.references;
        return Object.values(Quote).map(
          ({ postId, quoteId, createdAt, quoteParagraphPreview: { text }, userId }) => {
            const _creator = User[userId];
            const url = API_URL + _creator.username;

            const _refPost = Post[postId];
            const _refPostCreator = User[_refPost.creatorId];
            const _refPostCreatorUrl = API_URL + _refPostCreator.username;

            const refPost = {
              id: _refPost.id,
              title: _refPost.title,
              url: `${_refPostCreatorUrl}/${_refPost.uniqueSlug}`,
              createdAt: _refPost.createdAt,
              subtitle: _refPost.virtuals.subtitle,
              imageId:
                _refPost.virtuals.previewImage.imageId &&
                CONTENT_IMAGE_BASE_URL + _refPost.virtuals.previewImage.imageId,
              readingTime: _refPost.virtuals.readingTime,
              recommends: _refPost.virtuals.recommends,
              totalClapCount: _refPost.virtuals.totalClapCount,
              responsesCreatedCount: _refPost.virtuals.responsesCreatedCount,
              creator: {
                id: _refPost.creatorId,
                name: _refPostCreator.name,
                username: _refPostCreator.username,
                imageId: PROFILE_IMAGE_BASE_URL + _refPostCreator.imageId,
                bio: _refPostCreator.bio,
                url: _refPostCreatorUrl
              }
            };

            return {
              __source,
              id: quoteId,
              url: `https://medium.com/p/${postId}`,
              __createdAt: createdAt,
              text,
              refPost,
              creator: {
                id: _creator.userId,
                name: _creator.name,
                username: _creator.username,
                imageId: PROFILE_IMAGE_BASE_URL + _creator.imageId,
                bio: _creator.bio,
                url
              }
            };
          }
        );
      }

      default: {
        return data;
      }
    }
  }

  async user() {
    const source = { name: "medium", type: "user", form: "staticitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/`);
    return { success: true, source, data: Medium.parser(source, r.data) };
  }

  async latest() {
    const source = { name: "medium", type: "latest", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/latest`);
    return { success: true, source, data: Medium.parser(source, r.data) };
  }

  async recommended() {
    const source = { name: "medium", type: "recommended", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/has-recommended`);
    return { success: true, source, data: Medium.parser(source, r.data) };
  }

  async responses() {
    const source = { name: "medium", type: "responses", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/responses`);
    return { success: true, source, data: Medium.parser(source, r.data) };
  }

  async highlights() {
    const source = { name: "medium", type: "highlights", form: "listitems" };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    const r = await this.client.get(`/highlights`);
    return { success: true, source, data: Medium.parser(source, r.data) };
  }

  async _bucket() {
    const source = {
      name: "medium",
      type: "bucket",
      form: "staticitems|listitems"
    };
    if (!this.granted) {
      return { success: false, source, data: this.messages.NOT_AUTHORIZED };
    }
    let r = {
      user: this.user(),
      latest: this.latest(),
      recommended: this.recommended(),
      responses: this.responses(),
      highlights: this.highlights()
    };
    let d = {
      user: await r.user,
      latest: await r.latest,
      recommended: await r.recommended,
      responses: await r.responses,
      highlights: await r.highlights
    };

    return {
      success: true,
      source,
      data: {
        staticitems: { user: d.user.data },
        listitems: [
          ...d.latest.data,
          ...d.recommended.data,
          ...d.responses.data,
          ...d.highlights.data
        ]
      }
    };
  }
}

export default new Medium(MEDIUM_USERNAME);
