import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {User} from "@/lib/MongooseUserModel";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        throw err;
    }
}

export const getUser = async (email, password) => {
    try {
        await connectDB();

        const user = await User.findOne({email: email});
        if (user) {
            if (await bcrypt.compare(password, user._doc.password)) {
                return user;
            }
            return false;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error checking user existence:", error);
        throw error;
    }
};

export const createUser = async (email, password) => {
    try {
        await connectDB();

        const user = await User.findOne({email: email});
        if (user) {
            return false;
        }
        const doc = new User({
            email,
            password,
        })

        const newUser = await doc.save();
        return newUser;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

export async function updateUser(reqBody, id, data) {
    try {
        await connectDB();
        const user = await User.findOneAndDelete(
            {_id: id},
        );
        const updated = new User({...user._doc, ...data});
        await updated.save();
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export async function getUserDetails(id) {
    try {
        await connectDB();
        const user = await User.findOne(
            {_id: id},
        );
        return user?._doc;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const calculateAge = async (birthDateString) => {
    const birthDate = new Date(birthDateString);

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export const getChatHistory = async (date, id) => {
    try {
        await connectDB();
        const user = await User.findOne(
            {_id: id},
        );
        const diets = user?._doc?.diets;
        let userHistory = [];
        diets.map((day) => {
            if (date.getFullYear() === day.date.getFullYear() && date.getMonth() === day.date.getMonth() && date.getDate() === day.date.getDate()) {
                userHistory = day.history;
                return;
            }
        });

        if (userHistory.length > 0) {
            return userHistory;
        }

        const newDay = {
            date,
            history: []
        }
        await User.findOneAndUpdate(
            {_id: id},
            {$push: {diets: newDay}}
        );
        return [];
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const getProgramChatHistory = async (reqBody, id) => {
    try {
        await connectDB();
        const user = await User.findOne(
            {_id: id},
        );

        let history;
        if (user?._doc?.training) {
            history = user?._doc?.training[0]?.history;
        }
        let object;
        if (reqBody?.regenerate) {
            let date = new Date();
            object = {
                history: [],
                plan: [],
                date,
            }
        } else {
            object = {
                history: [],
                plan: [],
            }
        }

        if (!reqBody?.userModifications) {
            await User.findOneAndUpdate(
                {_id: id},
                {$unset: {training: ""}}
            );

            await User.findOneAndUpdate(
                {_id: id},
                {$push: {training: object}}
            );
        }

        if (history) {
            return history;
        }

        return [];
    } catch (error) {
        console.error('Error getting history:', error);
        throw error;
    }
}

export const addAiMessage = async (date, id, message) => {
    try {
        await connectDB();
        const msg = {
            role: "model",
            parts: [{text: message}],
        }
        const user = await User.findOne(
            {_id: id},
        );

        const diets = user?._doc?.diets;
        let today;

        diets.map((day, index) => {
            if (date.getFullYear() === day.date.getFullYear() && date.getMonth() === day.date.getMonth() && date.getDate() === day.date.getDate()) {
                today = index;
            }
        });

        const path = `diets.${today}.history`;

        await User.findOneAndUpdate(
            {_id: id},
            {$push: {[path]: msg}},
            {new: true, upsert: false}
        );
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const addUserMessage = async (date, id, message) => {
    try {
        await connectDB();
        const msg = {
            role: "user",
            parts: [{text: message}],
        }

        const user = await User.findOne(
            {_id: id},
        );

        const diets = user?._doc?.diets;
        let today;

        diets.map((day, index) => {
            if (date.getFullYear() === day.date.getFullYear() && date.getMonth() === day.date.getMonth() && date.getDate() === day.date.getDate()) {
                today = index;
            }
        });

        const path = `diets.${today}.history`;

        await User.findOneAndUpdate(
            {_id: id},
            {$push: {[path]: msg}},
            {new: true, upsert: false}
        );
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const getBan = async (id) => {
    try {
        await connectDB();
        const user = await User.findOne(
            {_id: id},
        );
        return user._doc.ban;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}
export const setBan = async (id) => {
    try {
        await connectDB();
        const date = new Date();
        const minutes = 5;
        date.setMinutes(date.getMinutes() + minutes);
        await User.findOneAndUpdate(
            {_id: id},
            {$set: {ban: {date: date, minutes: minutes}}}
        );
        return date;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const clearBan = async (id) => {
    try {
        await connectDB();
        await User.findOneAndUpdate(
            {_id: id},
            {$set: {ban: null}},
            {new: true},
        );
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const extendBan = async (id, ban) => {
    try {
        await connectDB();
        const newDate = new Date();
        const minutes = ban.minutes * 2;
        newDate.setMinutes(ban.date.getMinutes() + minutes);
        await User.findOneAndUpdate(
            {_id: id},
            {$set: {'ban.date': newDate, 'ban.minutes': minutes}},
            {new: true}
        );
        return newDate;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const addMistake = async (id) => {
    try {
        await connectDB();
        await User.findOneAndUpdate(
            {_id: id},
            {$inc: {mistakes: 1}},
            {new: true},
        );
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const clearMistakes = async (id) => {
    try {
        await connectDB();
        await User.findOneAndUpdate(
            {_id: id},
            {$set: {mistakes: 0}},
            {new: true},
        );
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const getMistakes = async (id) => {
    try {
        await connectDB();
        const user = await User.findOne(
            {_id: id},
        );
        return user._doc.mistakes;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export function getActivity(activity) {
    switch (activity) {
        case 1:
            return "Basal Metabolic Rate (BMR)";
        case 2:
            return "Sedentary: little or no exercise";
        case 3:
            return "Light: exercise 1-3 times/week";
        case 4:
            return "Moderate: exercise 4-5 times/week";
        case 5:
            return "Very Active: intense exercise 6-7 times/week";
    }
}

export function getGoal(goal) {
    switch (goal) {
        case 1:
            return "Losing fat (Cutting)";
        case 2:
            return "Save body shape (Maintaining)";
        case 3:
            return "Building muscle (Bulking)";
    }
}

export const addTrainingAiMessage = async (id, message) => {
    try {
        await connectDB();
        const msg = {
            role: "model",
            parts: [{text: message}],
        }

        const program = JSON.parse(message);

        await User.findOneAndUpdate(
            {_id: id},
            {$unset: {"training.0.plan": ""}}
        );

        await User.findOneAndUpdate(
            {_id: id},
            {$push: {"training.0.history": msg, "training.0.plan": program}},
            {new: true, upsert: false}
        );
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const addTrainingUserMessage = async (id, message) => {
    try {
        await connectDB();
        const msg = {
            role: "user",
            parts: [{text: message}],
        }

        await User.findOneAndUpdate(
            {_id: id},
            {$push: {"training.0.history": msg}},
            {new: true, upsert: false}
        );
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const startWorkout = async (id, day) => {
    try {
        await connectDB();
        const date = new Date();
        const userWorkout = {
            date,
            active: true,
            workout: day,
        }

        await User.findOneAndUpdate(
            {_id: id},
            {$push: {workouts: userWorkout}},
            {new: true, upsert: false}
        );
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}
export const endWorkout = async (id, day, timer) => {
    try {
        await connectDB();
        const user = await getUserDetails(id);
        const workouts = user?.workouts;
        let lastIndex;
        if (workouts) {
            lastIndex = workouts.length - 1;
        }
        const path = `workouts.${lastIndex}`;

        await User.findOneAndUpdate(
            {_id: id},
            {$unset: {[path]: ""}}
        );

        const activeWorkout = workouts[lastIndex];
        activeWorkout.active = false;
        activeWorkout.workout = day;
        activeWorkout.timer = timer;

        await User.findOneAndUpdate(
            {_id: id},
            {[path]: activeWorkout}
        );
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}