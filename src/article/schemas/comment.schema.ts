import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Author } from 'src/profile/schemas/profile.schema';
import { User, UserDocument } from '../../user/schemas/user.schema';

export type CommentDocument = Comment & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  body: string;

  @Field(() => Author)
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  author: UserDocument | string;

  @Prop({ required: true })
  slug: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.set('toJSON', {
  transform: function (_, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.slug;
    return ret;
  },
});
