import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Model } from 'mongoose';
import { ProfileService } from '../profile/profile.service';
import { TagService } from '../tag/tag.service';
import { UserService } from '../user/user.service';
import { CreateArticleInput } from './dto/create-article.input';
import { PaginationInput, QueryArticleInput } from './dto/query-article.input';
import { UpdateArticleInput } from './dto/update-article.input';
import { Article, ArticleDocument } from './schemas/article.schema';
import { FavoritedService } from './favorite.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name)
    private readonly articleModel: Model<ArticleDocument>,

    private readonly tagService: TagService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    @Inject(forwardRef(() => FavoritedService))
    private favoriteService: FavoritedService,
  ) {}

  async createArticle(userId: string, createArticleInput: CreateArticleInput) {
    const author = await this.userService.getUserById(userId);
    let article = new this.articleModel(createArticleInput);
    article.author = author._id;
    article = await article.save();
    createArticleInput.tagList.forEach((tag) => {
      this.tagService.createTag(tag);
    });
    return article.toJSON();
  }

  async updateArticle(
    slug: string,
    userId: string,
    updateArticleInput: UpdateArticleInput,
  ) {
    const article = await this.getArticleBySlug(slug);
    if (article.author.toString() !== userId) {
      throw new ForbiddenError('articles is not created by you');
    }

    Object.assign(article, updateArticleInput);
    return article.save();
  }

  async deleteArticle(slug: string, userId: string) {
    const article = await this.getArticleBySlug(slug);

    if (article.author?.toString() !== userId) {
      throw new ForbiddenError('articles is not created by you');
    }
    await this.articleModel.deleteOne({ slug });
    await this.favoriteService.deleteBytArtcileId(article.id);
    return 'ok';
  }

  private async getArticlesFindParamsBytInput(input: QueryArticleInput) {
    const params = {};
    if (input.tag) {
      params['tagList'] = { $elemMatch: { $eq: input.tag } };
    }

    if (input.favorited) {
      const favorited = await this.userService.getUserByUsername(
        input.favorited,
      );
      const articles = await this.favoriteService.findByUserId(favorited.id);
      params['_id'] = { $in: articles.map((item) => item._id) };
    }

    if (input.author) {
      const author = await this.userService.getUserByUsername(input.author);
      params['author'] = { $eq: author?._id };
    }
    return params;
  }

  async getArticles(queryArticleInput: QueryArticleInput) {
    const { offset, limit } = queryArticleInput;
    const params = await this.getArticlesFindParamsBytInput(queryArticleInput);

    return this.articleModel
      .find(params)
      .sort({ updatedAt: -1 })
      .skip(+offset)
      .limit(+limit);
  }

  async getArticlesCount(queryArticleInput: QueryArticleInput) {
    const params = await this.getArticlesFindParamsBytInput(queryArticleInput);
    return this.articleModel.countDocuments(params);
  }

  private async getArticlesByFollowingFindParams(userId: string) {
    const follows = await this.profileService.getFollowings(userId);
    return {
      author: { $in: follows },
    };
  }

  async getArticlesByFollowing(
    userId: string,
    paginationInput: PaginationInput,
  ) {
    const { offset, limit } = paginationInput;
    const params = await this.getArticlesByFollowingFindParams(userId);
    return this.articleModel
      .find(params)
      .sort({ updatedAt: -1 })
      .skip(+offset)
      .limit(+limit);
  }

  async getArticlesByFollowingCount(userId: string) {
    const params = await this.getArticlesByFollowingFindParams(userId);
    return this.articleModel.countDocuments(params);
  }

  async getArticleBySlug(slug: string) {
    const article = await this.articleModel.findOne({ slug });
    if (!article) {
      throw new UserInputError('article is not exisited');
    }
    return article;
  }
}
