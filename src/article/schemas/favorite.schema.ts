import { ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { Article, ArticleDocument } from './article.schema';

export type FavoriteDocument = Favorite & Document;

@ObjectType()
@Schema()
export class Favorite {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  user: UserDocument | Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Article.name })
  article: ArticleDocument | Types.ObjectId;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

FavoriteSchema.index({ user: 1, article: 1 }, { unique: true });
