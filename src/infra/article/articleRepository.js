/* @flow */
import type { EditingArticle, ArticleRepository } from '../../domain/article';
import typeof * as ConduitApiService from '../conduit/conduitApiService';

type Dependencies = {
  conduitApiService: ConduitApiService
};

export default ({ conduitApiService }: Dependencies): ArticleRepository => ({
  async fromGlobalFeed() {
    const { data } = await conduitApiService.get('articles');

    return {
      ...data,
      articles: data.articles.map(this._coerceArticle)
    };
  },

 async fromUserFeed(user) {
    const { data } = await conduitApiService.authGet('articles/feed', user);

    return {
      ...data,
      articles: data.articles.map(this._coerceArticle)
    };
  },

  async fromTagFeed(tag) {
    const { data } = await conduitApiService.get('articles', {
      params: { tag }
    });

    return {
      ...data,
      articles: data.articles.map(this._coerceArticle)
    };
  },

  async fromAuthorFeed(authorUsername) {
    const { data } = await conduitApiService.get('articles', {
      params: { author: authorUsername }
    });

    return {
      ...data,
      articles: data.articles.map(this._coerceArticle)
    };
  },

  async fromAuthorFavorites(authorUsername) {
    const { data } = await conduitApiService.get('articles', {
      params: { favorited: authorUsername }
    });

    return {
      ...data,
      articles: data.articles.map(this._coerceArticle)
    };
  },

  async getArticle(slug) {
    const { data } = await conduitApiService.get(`articles/${slug}`);

    return this._coerceArticle(data.article);
  },

  async add(editingArticle, { currentUser }) {
    const { data } = await conduitApiService.authPost('articles', currentUser, {
      article: editingArticle
    });

    return this._coerceArticle(data.article);
  },

  async update(article, { currentUser }) {
    const slug = article.slug || '';

    const { data } = await conduitApiService.authPut(`articles/${slug}`, currentUser, {
      article: this._serializeArticle(article)
    });

    return this._coerceArticle(data.article);
  },

  _coerceArticle(rawArticle: any) {
    return {
      ...rawArticle,
      createdAt: new Date(rawArticle.createdAt)
    };
  },

  _serializeArticle(article: EditingArticle) {
    const {
      title,
      description,
      body,
      tagList
    } = article;

    return {
      title,
      description,
      body,
      tagList
    };
  }
});
