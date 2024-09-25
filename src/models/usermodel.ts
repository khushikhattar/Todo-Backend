import mongoose, { Schema, Document, Model, Types } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface User extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  todolist: Types.ObjectId;
  refreshtoken: string;
  createdAt?: Date;
  updatedAt?: Date;
  genAccessToken: () => string;
  genRefreshToken: () => string;
  isPasswordCorrect: (password: string) => Promise<boolean>;
}

const userSchema: Schema<User> = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    todolist: {
      type: Schema.Types.ObjectId,
      ref: "Todo",
    },
    refreshtoken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.genaccesstoken = function (): String {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.genrefreshtoken = function (): String {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User: Model<User> = mongoose.model<User>("User", userSchema);
