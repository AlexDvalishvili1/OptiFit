"use client";
import Image from "next/image";
import React, {useState} from "react";
import useWindowSize from "@/components/WindowSize";

function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - (day === 0 ? 6 : day - 1);
    return new Date(date.setDate(diff));
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HistoryCircle = ({history, setSelected}) => {
    const [rotationState, setRotationState] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const screenSize = useWindowSize();

    const isWorkoutOnDay = (dayOfWeek) => {
        const startOfWeek = getStartOfWeek(new Date());
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + dayOfWeek);

        return history.some(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate.toDateString() === targetDate.toDateString();
        });
    }

    const getWorkoutsOnDay = (dayOfWeek) => {
        const startOfWeek = getStartOfWeek(new Date());
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + dayOfWeek);

        return history.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate.toDateString() === targetDate.toDateString();
        });
    }

    const handleClick = (index) => {
        const workouts = getWorkoutsOnDay(index);
        setSelected(workouts);
    }

    const handleMouseEnter = () => {
        const circle = document.querySelector(".workout-history__circle");
        const computedStyle = window.getComputedStyle(circle);
        const transform = computedStyle.getPropertyValue("transform");
        const values = transform.split('(')[1].split(')')[0].split(',');
        const a = values[0];
        const b = values[1];
        const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        setRotationState(angle);
        setIsHovered(true);
    }

    const handleMouseLeave = () => {
        setIsHovered(false);
    }

    return (
        <div className="workout-circle__container">
            <Image src={"/logo_small.svg"} alt={"Logo"} style={{position: "absolute"}} width={100} height={100}
                   priority={true}/>
            <div
                className="workout-history__circle"
                style={{transform: `rotate(${rotationState}deg)`}}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {daysOfWeek.map((day, index) => (
                    <button
                        className="workout-history__day"
                        key={index}
                        disabled={!isWorkoutOnDay(index)}
                        style={screenSize.width > 480 ? {
                            transform: `rotate(${index * (360 / daysOfWeek.length)}deg) translate(150px) rotate(${-index * (360 / daysOfWeek.length)}deg)`
                        } : {transform: `rotate(${index * (360 / daysOfWeek.length)}deg) translate(100px) rotate(${-index * (360 / daysOfWeek.length)}deg)`}}
                        onClick={() => handleClick(index)}
                    >
                        <span style={isHovered ? {animationPlayState: "paused"} : {}}>{day}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HistoryCircle;
