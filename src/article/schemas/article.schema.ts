import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 } from 'uuid';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { Author } from '../../profile/schemas/profile.schema';

export type ArticleDocument = Article & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  tagList: Array<string>;

  @Field(() => Author)
  @Prop({ type: Types.ObjectId, ref: User.name })
  author: UserDocument | Types.ObjectId;

  favoritesCount: number;

  favorited: boolean;

  @Prop()
  slug: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.set('toJSON', {
  transform: function (_, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

ArticleSchema.pre('save', async function () {
  if (this.isNew || this.isModified('title')) {
    this.set({
      slug: v4(),
    });
  }
});
