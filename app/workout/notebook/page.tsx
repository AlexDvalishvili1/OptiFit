"use client";
import React, { useEffect, useState } from "react";
import Container from "../../../components/Container";
import { NotebookContext } from "@/components/NotebookContext";
import { useRouter } from "next/navigation";
import {
    fetchActiveWorkout,
    fetchPlannedWorkout,
    startWorkoutRequest,
    endWorkoutRequest
} from "@/components/Workout/Notebook/apiRequests";
import { getTimePassed } from "@/components/Workout/Notebook/timerUtils";
import NotebookWorkout from "@/components/Workout/Notebook/NotebookWorkout";
import Confirmation from "@/components/Workout/Notebook/Confirmation";

const Notebook = () => {
    const router = useRouter();
    const [loadingData, setLoadingData] = useState(true);
    const [workout, setWorkout] = useState(null);
    const [day, setDay] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [confirmation, setConfirmation] = useState(false);
    const [timer, setTimer] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const activeWorkoutResponse = await fetchActiveWorkout();
            if (activeWorkoutResponse?.result) {
                setDay(activeWorkoutResponse.result.workout);
                setTimer(getTimePassed(activeWorkoutResponse.result.date));
            } else {
                const plannedWorkoutResponse = await fetchPlannedWorkout();
                if (plannedWorkoutResponse?.result) {
                    setWorkout(plannedWorkoutResponse.result);
                }
            }
            setLoadingData(false);
        };

        if (typeof window !== "undefined") {
            fetchData();
        }
    }, []);

    const startWorkout = async () => {
        const startResponse = await startWorkoutRequest(confirmation);
        if (startResponse?.result) {
            setDay(confirmation);
        }
        setConfirmation(false);
    };

    const endWorkout = async () => {
        setError(null);
        setSuccess(false);
        const endResponse = await endWorkoutRequest(timer, day);
        if (endResponse?.result) {
            setSuccess(endResponse.result);
            router.push("/workout/history");
        }
        if (endResponse?.error) {
            setError(endResponse.error);
        }
    };

    const dayHandler = (selectedDay : any) => {
        setConfirmation(selectedDay);
    };

    return (
        <NotebookContext.Provider value={{ day, setDay }}>
            <Container style={{ position: "relative" }}>
                <p className={"notebook__timer"}>
                    {day &&
                        timer &&
                        `${timer?.days > 0 ? timer.days + ":" : ""}${
                            timer?.hours > 0
                                ? String(timer.hours).padStart(2, "0") + ":"
                                : "00:"
                        }${String(timer?.minutes).padStart(2, "0")}:${String(
                            timer?.seconds
                        ).padStart(2, "0")}`}
                </p>
                {confirmation ? (
                    <Confirmation
                        title={"Do you want to start this workout?"}
                        setConfirmation={setConfirmation}
                        onAgree={startWorkout}
                        confirmation={confirmation}
                    />
                ) : (
                    <NotebookWorkout
                        endWorkout={endWorkout}
                        workout={workout}
                        loadingData={loadingData}
                        setTimer={setTimer}
                        success={success}
                        error={error}
                        timer={timer}
                        dayHandler={dayHandler}
                    />
                )}
            </Container>
        </NotebookContext.Provider>
    );
};

export default Notebook;
