import {connectDB} from "../lib/db.ts";
import {User} from "../models/User.ts";

export async function getUserDetails(id) {
    try {
        await connectDB()
        const user = await User.findOne(
            {_id: id},
        );
        return user?._doc;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const getChatHistory = async (date, user) => {
    try {
        const diets = user?.diets;
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

        const newHistory = [
            {
                role: "system",
                content:
                    "Follow the user's instructions exactly. If they require JSON-only output, return JSON only."
            },
        ];

        const newDay = {
            date,
            history: newHistory,
        }
        await User.findOneAndUpdate(
            {_id: user._id},
            {$push: {diets: newDay}}
        );
        return newHistory;
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

export const addUserMessage = async (date, id, message) => {
    try {
        await connectDB();
        const msg = {
            role: "user",
            content: message,
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

export const addAiMessage = async (date, id, message) => {
    try {
        await connectDB();
        const msg = {
            role: "system",
            content: message,
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

export const getProgramChatHistory = async (reqBody, user) => {
    try {
        let history;
        if (user?.training) {
            history = user?.training[0]?.history;
        }

        const newHistory = [
            {
                role: "system",
                content:
                    "Follow the user's instructions exactly. If they require JSON-only output, return JSON only."
            },
        ];

        let object;
        if (reqBody?.regenerate) {
            let date = new Date();
            object = {
                history: newHistory,
                plan: [],
                date,
            }
        } else {
            object = {
                history: newHistory,
                plan: [],
            }
        }

        if (!reqBody?.modifying) {
            await User.findOneAndUpdate(
                {_id: user._id},
                {$unset: {training: ""}}
            );

            await User.findOneAndUpdate(
                {_id: user._id},
                {$push: {training: object}}
            );
        }

        if (history) {
            return history;
        }

        return newHistory;
    } catch (error) {
        console.error('Error getting history:', error);
        throw error;
    }
}

export const addWorkoutUserMessage = async (id, message) => {
    try {
        await connectDB();
        const msg = {
            role: "user",
            content: message,
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

export const addWorkoutAiMessage = async (id, message) => {
    try {
        await connectDB();
        const msg = {
            role: "system",
            content: message,
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