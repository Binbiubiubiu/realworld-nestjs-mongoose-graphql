import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagModule } from '../tag/tag.module';
import { UserModule } from '../user/user.module';
import { ProfileModule } from './../profile/profile.module';
import { ArticleResolver } from './article.resolver';
import { ArticleService } from './article.service';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { Article, ArticleSchema } from './schemas/article.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { FavoritedService } from './favorite.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Article.name, schema: ArticleSchema },
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    UserModule,
    TagModule,
    ProfileModule,
  ],
  providers: [
    ArticleService,
    FavoritedService,
    CommentService,
    ArticleResolver,
    CommentResolver,
  ],
})
export class ArticleModule {}
