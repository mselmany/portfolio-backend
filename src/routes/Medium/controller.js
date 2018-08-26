import { ApiBase, Utils } from "@/helpers";

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

  static parser(type, _data) {
    let data = JSON.parse(_data.replace("])}while(1);</x>", ""));
    switch (type) {
      case "latest": {
        let { user, userMeta, references } = data.payload;
        let { name, userId, username, imageId, bio } = user;
        let { Post, SocialStats } = references;

        const { numberOfPostsPublished } = userMeta;
        const { usersFollowedCount, usersFollowedByCount } = SocialStats[
          userId
        ];

        let items = Object.values(Post).map(item => {
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

        return {
          type,
          userId,
          name,
          username,
          imageId,
          bio,
          usersFollowedCount,
          usersFollowedByCount,
          numberOfPostsPublished,
          items
        };
      }

      case "recommended": {
        let { user, userMeta, references } = data.payload;
        let { name, userId, username, imageId, bio } = user;
        let { User, Post, SocialStats } = references;

        const { numberOfPostsPublished } = userMeta;
        const { usersFollowedCount, usersFollowedByCount } = SocialStats[
          userId
        ];

        let items = Object.values(Post).map(item => {
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

        return {
          type,
          userId,
          name,
          username,
          imageId,
          bio,
          usersFollowedCount,
          usersFollowedByCount,
          numberOfPostsPublished,
          items
        };
      }

      case "responses": {
        let { user, userMeta, references } = data.payload;
        let { name, userId, username, imageId, bio } = user;
        let { User, Post, SocialStats } = references;

        const { numberOfPostsPublished } = userMeta;
        const { usersFollowedCount, usersFollowedByCount } = SocialStats[
          userId
        ];

        let items = Object.values(Post)
          .filter(item => item.creatorId === userId)
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

        return {
          type,
          userId,
          name,
          username,
          imageId,
          bio,
          usersFollowedCount,
          usersFollowedByCount,
          numberOfPostsPublished,
          items
        };
      }

      case "highlights": {
        let { user, userMeta, references } = data.payload;
        let { name, userId, username, imageId, bio } = user;
        let { Quote, User, Post, SocialStats } = references;

        const { numberOfPostsPublished } = userMeta;
        const { usersFollowedCount, usersFollowedByCount } = SocialStats[
          userId
        ];

        let items = Object.values(Quote).map(item => {
          let _post = Post[item.postId];
          let _creator = User[_post.creatorId];

          return {
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

        return {
          type,
          userId,
          name,
          username,
          imageId,
          bio,
          usersFollowedCount,
          usersFollowedByCount,
          numberOfPostsPublished,
          items
        };
      }

      default: {
        return data;
      }
    }
  }

  async latest() {
    if (!this.granted) {
      return {
        success: false,
        class: "medium.latest",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/latest`);
    return {
      success: true,
      class: "medium.latest",
      data: Medium.parser("latest", r.data)
    };
  }

  async recommended() {
    if (!this.granted) {
      return {
        success: false,
        class: "medium.recommended",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/has-recommended`);
    return {
      success: true,
      class: "medium.recommended",
      data: Medium.parser("recommended", r.data)
    };
  }

  async responses() {
    if (!this.granted) {
      return {
        success: false,
        class: "medium.responses",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/responses`);
    return {
      success: true,
      class: "medium.responses",
      data: Medium.parser("responses", r.data)
    };
  }

  async highlights() {
    if (!this.granted) {
      return {
        success: false,
        class: "medium.highlights",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    const r = await this.client.get(`/highlights`);
    return {
      success: true,
      class: "medium.highlights",
      data: Medium.parser("highlights", r.data)
    };
  }

  async _bucket() {
    if (!this.granted) {
      return {
        success: false,
        class: "medium.bucket",
        data: this.messages.NOT_AUTHORIZED
      };
    }
    let r = {
      latest: this.latest(),
      recommended: this.recommended(),
      responses: this.responses(),
      highlights: this.highlights()
    };
    return {
      success: true,
      class: "medium.bucket",
      data: {
        latest: await r.latest,
        recommended: await r.recommended,
        responses: await r.responses,
        highlights: await r.highlights
      }
    };
  }
}

export default new Medium(MEDIUM_USERNAME);
