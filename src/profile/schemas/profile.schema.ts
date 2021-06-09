import { ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User, UserDocument } from '../../user/schemas/user.schema';

export type ProfileDocument = Profile & Document;

@Schema()
export class Profile {
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  followor: UserDocument | Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  following: UserDocument | Types.ObjectId;
}

@ObjectType()
export class Author extends User {
  following: boolean;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

ProfileSchema.index({ followor: 1, following: 1 }, { unique: true });
