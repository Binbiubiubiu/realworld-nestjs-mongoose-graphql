import { ObjectType, Field, Int, HideField } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';

export type UserDocument = User &
  Document & {
    comparePassword(candidatePassword: string): Promise<boolean>;
  };

@ObjectType()
@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @HideField()
  @Prop({ required: true })
  password: string;

  @Prop()
  image?: string;

  @Prop()
  bio?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  transform: function (_, ret) {
    ret.id = ret._id;
    delete ret.password;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

UserSchema.pre('save', async function () {
  if (this.isNew || this.isModified('password')) {
    const salt = await bcrypt.genSalt(5);
    this.set({
      password: await bcrypt.hash(this.get('password'), salt),
    });
  }
});

UserSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.get('password'));
};
