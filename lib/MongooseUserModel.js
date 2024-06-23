import {model, models, Schema} from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    name: {type: String},
    email: {type: String, required: true},
    password: {type: String},
    gender: {type: Boolean},
    dob: {type: Date},
    height: {type: Number},
    weight: {type: Number},
    activity: {type: Number},
    goal: {type: Number},
    image: {type: String},
    emailVerified: {type: Boolean},
    advanced: {type: Boolean},
    allergies: [{type: Object}],
    diets: [{type: Object}],
    training: [{type: Object}],
    mistakes: {type: Number},
    ban: {type: Object},
    workouts: [{type: Object}],
});

userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

export const User = models.User || model("User", userSchema);
