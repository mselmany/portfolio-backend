import { ApiBase } from "@/helpers";

const MEDIUM_USERNAME = process.env.MEDIUM_USERNAME;
const API_URL = "https://medium.com/@";

class Medium extends ApiBase {
  constructor(username) {
    super(
      { baseURL: API_URL + username, init: { username } },
      {
        interceptor: config =>
          (config.params = { ...config.params, format: "json" })
      }
    );
    this.username = username;
    this.authorization = true;
  }

  static parser({ name, type, form }, payload) {
    if (!payload) {
      return [];
    }
    try {
      var data = JSON.parse(payload.replace("])}while(1);</x>", ""));
    } catch (err) {
      return [];
    }
    switch (type) {
      case "user": {
        let { user, userMeta, references } = data.payload;
        let { userId, username, imageId, bio } = user;
        let { SocialStats } = references;

        const { numberOfPostsPublished } = userMeta;
        const { usersFollowedCount, usersFollowedByCount } = SocialStats[
          userId
        ];

        return {
          __source: { name, type, form },
          userId,
          name: user.name,
          username,
          imageId,
          bio,
          usersFollowedCount,
          usersFollowedByCount,
          numberOfPostsPublished
        };
      }

      case "latest": {
        let { Post } = data.payload.references;
        return Object.values(Post).map(item => {
          const { id, title, createdAt, virtuals } = item;
          const {
            subtitle,
            previewImage,
            readingTime,
            recommends,
            totalClapCount,
            responsesCreatedCount
          } = virtuals;

          return {
            __source: { name, type, form },
            id,
            title,
            createdAt,
            subtitle,
            imageId: previewImage.imageId,
            readingTime,
            recommends,
            totalClapCount,
            responsesCreatedCount
          };
        });
      }

      case "recommended": {
        let { Post, User } = data.payload.references;
        return Object.values(Post).map(item => {
          const { id, title, createdAt, creatorId, virtuals } = item;
          const {
            subtitle,
            previewImage,
            readingTime,
            recommends,
            totalClapCount,
            responsesCreatedCount
          } = virtuals;
          const _creator = User[creatorId];

          return {
            __source: { name, type, form },
            id,
            title,
            createdAt,
            subtitle,
            imageId: previewImage.imageId,
            readingTime,
            recommends,
            totalClapCount,
            responsesCreatedCount,
            creator: {
              id: creatorId,
              name: _creator.name,
              username: _creator.username,
              imageId: _creator.imageId,
              bio: _creator.bio
            }
          };
        });
      }

      case "responses": {
        let { user, references } = data.payload;
        let { Post, User } = references;
        return Object.values(Post)
          .filter(item => item.creatorId === user.userId)
          .map(item => {
            const {
              id,
              inResponseToPostId,
              createdAt,
              virtuals,
              previewContent
            } = item;
            const {
              readingTime,
              recommends,
              totalClapCount,
              responsesCreatedCount
            } = virtuals;

            const text = previewContent.bodyModel.paragraphs.map(p => p.text);

            const _refPost = Post[inResponseToPostId];
            const _refPostCreator = User[_refPost.creatorId];

            const refPost = {
              id: _refPost.id,
              title: _refPost.title,
              createdAt: _refPost.createdAt,
              subtitle: _refPost.virtuals.subtitle,
              imageId: _refPost.virtuals.previewImage.imageId,
              readingTime: _refPost.virtuals.readingTime,
              recommends: _refPost.virtuals.recommends,
              totalClapCount: _refPost.virtuals.totalClapCount,
              responsesCreatedCount: _refPost.virtuals.responsesCreatedCount,
              creator: {
                id: _refPost.creatorId,
                name: _refPostCreator.name,
                username: _refPostCreator.username,
                imageId: _refPostCreator.imageId,
                bio: _refPostCreator.bio
              }
            };

            return {
              __source: { name, type, form },
              id,
              createdAt,
              readingTime,
              recommends,
              totalClapCount,
              responsesCreatedCount,
              refPost,
              text
            };
          });
      }

      case "highlights": {
        let { Quote, User, Post } = data.payload.references;
        return Object.values(Quote).map(item => {
          let _post = Post[item.postId];
          let _creator = User[_post.creatorId];

          return {
            __source: { name, type, form },
            id: item.quoteId,
            createdAt: item.createdAt,
            text: item.quoteParagraphPreview.text,
            post: {
              id: _post.id,
              title: _post.title,
              createdAt: _post.createdAt,
              subtitle: _post.virtuals.subtitle,
              imageId: _post.virtuals.previewImage.imageId,
              readingTime: _post.virtuals.readingTime,
              recommends: _post.virtuals.recommends,
              totalClapCount: _post.virtuals.totalClapCount,
              responsesCreatedCount: _post.virtuals.responsesCreatedCount,
              creator: {
                id: _creator.userId,
                name: _creator.name,
                username: _creator.username,
                imageId: _creator.imageId
              }
            }
          };
        });
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
        staticitems: d.user.data,
        listitems: [
          ...d.latest.data,
          ...d.recommended.data,
          ...d.responses.data,
          ...d.highlights.data
        ].sort((a, b) => b.createdAt - a.createdAt)
      }
    };
  }
}

export default new Medium(MEDIUM_USERNAME);
