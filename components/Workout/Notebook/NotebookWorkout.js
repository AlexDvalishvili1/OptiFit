"use client";
import {CircularProgress} from "@mui/material";
import TrainingPlan from "@/components/Workout/TrainingPlan";
import ExerciseCard from "@/components/Workout/ExerciseCard";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import Colors from "@/app/colors";
import React, {useContext, useEffect, useState} from "react";
import Confirmation from "./Confirmation";
import {NotebookContext} from "@/components/NotebookContext";

const NotebookWorkout = ({loadingData, workout, error, success, setTimer, endWorkout, dayHandler, timer}) => {
    const [confirmation, setConfirmation] = useState(false);
    const {day, setDay} = useContext(NotebookContext);
    const endConfirmHandler = () => {
        setConfirmation(false);
        endWorkout();
    }

    useEffect(() => {
        if (timer && day) {
            const interval = setInterval(() => {
                setTimer(prevTimer => {
                    const newSeconds = prevTimer.seconds + 1;
                    const newMinutes = prevTimer.minutes + Math.floor(newSeconds / 60);
                    const newHours = prevTimer.hours + Math.floor(newMinutes / 60);
                    return {
                        days: prevTimer.days,
                        hours: newHours % 24,
                        minutes: newMinutes % 60,
                        seconds: newSeconds % 60
                    };
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [day, timer]);

    return (
        <div className={"workout__days"}>
            {loadingData && <CircularProgress size={60}/>}
            {!day && workout &&
                <TrainingPlan dayHandler={dayHandler} data={workout[0]} onlyMuscles={true}/>
            }
            {day && (
                <div className={"notebook__day"}>
                    <h3 className="exercise__day-title">{day?.muscles}</h3>
                    <div className={"notebook__exercises"}>
                        {day?.exercises?.map((exercise, index) => (
                            <ExerciseCard key={index} notebook={true} exerciseIndex={index} data={exercise}/>))}
                    </div>
                    <ErrorMessage message={error || success} justifyContent={"center"} success={success}/>
                    <Confirmation confirmation={confirmation} setConfirmation={setConfirmation}
                                  onAgree={endConfirmHandler}
                                  title={"Do you want to end this workout?"}/>
                    <Button className={"notebook__end-workout"} title={"End Workout"}
                            onClick={() => setConfirmation(true)} variant={Colors.styles.white}/>
                </div>
            )}
        </div>
    );
};

export default NotebookWorkout;