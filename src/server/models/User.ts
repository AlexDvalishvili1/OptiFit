import {model, models, Schema, type InferSchemaType, type Model} from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    name: {type: String},

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    password: {type: String},
    gender: {type: String},
    dob: {type: Date},
    height: {type: Number},
    weight: {type: Number},
    activity: {type: String},
    goal: {type: String},
    image: {type: String},
    emailVerified: {type: Boolean},
    advanced: {type: Boolean},

    // пока оставляем как у тебя (позже улучшим)
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

export const User: Model<UserSchema> =
    (models.User as Model<UserSchema>) || model<UserSchema>("User", userSchema);