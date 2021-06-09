import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ArticleService } from './article.service';
import { ArticleDocument } from './schemas/article.schema';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';

@Injectable()
export class FavoritedService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
    @Inject(forwardRef(() => ArticleService))
    private readonly articleService: ArticleService,
  ) {}

  async getArticleFavorited(userId: string, articleId: string) {
    return this.favoriteModel.exists({
      article: new Types.ObjectId(articleId),
      user: new Types.ObjectId(userId),
    });
  }

  async getArticleFavoritesCount(articleId: string) {
    return this.favoriteModel.countDocuments({
      article: new Types.ObjectId(articleId),
    });
  }

  async isFavorited(userId: string, article: ArticleDocument) {
    return this.favoriteModel.exists({
      user: Types.ObjectId(userId),
      article: article._id,
    });
  }

  async favoriteArticle(userId: string, slug: string) {
    const article = await this.articleService.getArticleBySlug(slug);

    const hasFavorited = await this.getArticleFavorited(userId, article.id);
    if (!hasFavorited) {
      try {
        await new this.favoriteModel({
          user: new Types.ObjectId(userId),
          article: article._id,
        }).save();
      } catch (err) {
        if (err.code !== 11000) {
          throw err;
        }
      }
    }

    return article.toJSON();
  }

  async unfavoriteArticle(userId: string, slug: string) {
    const article = await this.articleService.getArticleBySlug(slug);
    const hasFavorited = await this.getArticleFavorited(userId, article.id);
    if (hasFavorited) {
      await this.favoriteModel.deleteOne({
        user: new Types.ObjectId(userId),
        article: article._id,
      });
    }
    return article.toJSON();
  }

  async deleteBytArtcileId(articleId: string) {
    return this.favoriteModel.deleteMany({
      article: new Types.ObjectId(articleId),
    });
  }

  async findByUserId(userId: string) {
    return this.favoriteModel.find({
      user: new Types.ObjectId(userId),
    });
  }
}
