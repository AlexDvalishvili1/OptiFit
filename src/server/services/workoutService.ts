export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {connectDB} from "@/server/db/connect";
import {findUserLeanById, updateUserById} from "@/server/repositories/userRepo";

type WorkoutEntry = { date: Date; active: boolean; workout: unknown; timer?: unknown };

export async function startWorkout(id: string, day: unknown) {
    await connectDB();
    const userWorkout: WorkoutEntry = {date: new Date(), active: true, workout: day};
    await updateUserById(id, {$push: {workouts: userWorkout}}, {new: true, upsert: false});
}

export async function endWorkout(id: string, day: unknown, timer: unknown) {
    await connectDB();
    const user = (await findUserLeanById(id)) as { workouts?: WorkoutEntry[] } | null;
    const workouts = user?.workouts ?? [];
    const lastIndex = workouts.length - 1;
    if (lastIndex < 0) return;

    const path = `workouts.${lastIndex}`;

    await updateUserById(id, {$unset: {[path]: ""}});

    const activeWorkout = workouts[lastIndex];
    activeWorkout.active = false;
    activeWorkout.workout = day;
    activeWorkout.timer = timer;

    await updateUserById(id, {$set: {[path]: activeWorkout}});
}