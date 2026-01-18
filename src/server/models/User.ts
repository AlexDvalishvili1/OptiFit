import {model, models, Schema, type InferSchemaType, type Model, type HydratedDocument} from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    name: {type: String},

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        select: false,
    },

    password: {type: String},
    gender: {type: String},
    dob: {type: Date},
    height: {type: Number},
    weight: {type: Number},
    activity: {type: String},
    goal: {type: String},
    image: {type: String},
    advanced: {type: Boolean},

    allergies: [{type: Object}],
    diets: [{type: Object}],
    training: [{type: Object}],
    mistakes: {type: Number},
    ban: {type: Object},
    workouts: [{type: Object}],
});

userSchema.pre("save", async function () {
    if (this.isModified("password") && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

export type UserSchema = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<UserSchema>;

export const User: Model<UserSchema> =
    (models.User as Model<UserSchema>) || model<UserSchema>("User", userSchema);