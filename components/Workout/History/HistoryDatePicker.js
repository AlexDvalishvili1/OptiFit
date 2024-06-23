import React from 'react';
import {Calendar} from 'react-date-range';
import './HistoryDatePicker.css';

const HistoryDatePicker = ({history, setSelected}) => {
    const handleSelect = (date) => {
        const workoutsOnDate = history.filter(workout => {
            const workoutDate = new Date(workout.date);
            return (
                workoutDate.getFullYear() === date.getFullYear() &&
                workoutDate.getMonth() === date.getMonth() &&
                workoutDate.getDate() === date.getDate()
            );
        });

        setSelected(workoutsOnDate);
    };

    const renderDayContent = (date) => {
        const workoutsOnDate = history.filter(workout => {
            const workoutDate = new Date(workout.date);
            return (
                workoutDate.getFullYear() === date.getFullYear() &&
                workoutDate.getMonth() === date.getMonth() &&
                workoutDate.getDate() === date.getDate()
            );
        });

        const isActive = new Date().toDateString() === date.toDateString();

        return (
            <div
                className={`calendar-day ${workoutsOnDate.length > 0 ? 'highlight' : ''} ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(date)}
            >
                <span>{date.getDate()}</span>
                {workoutsOnDate.length > 0 &&
                    <ul className="workouts-list">
                        {workoutsOnDate.map((workout, index) => (
                            <li key={index}>{workout.title}</li> // Assuming workout has a title property
                        ))}
                    </ul>
                }
            </div>
        );
    };

    const getDisabledDates = () => {
        if (history.length === 0) {
            return [];
        }

        const enabledDates = history.map(workout => new Date(workout.date).toDateString());
        const disabledDates = [];

        // Iterate through days between the min and max date in history
        const startDate = new Date(Math.min(...history.map(workout => new Date(workout.date))));
        const endDate = new Date(Math.max(...history.map(workout => new Date(workout.date))));

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateString = date.toDateString();

            // Disable date if it's not in the enabledDates array
            if (!enabledDates.includes(dateString)) {
                disabledDates.push(new Date(date));
            }
        }

        return disabledDates;
    };


    const {minDate, maxDate} = history.length > 0 ? {
        minDate: new Date(Math.min(...history.map(workout => new Date(workout.date)))),
        maxDate: new Date(Math.max(...history.map(workout => new Date(workout.date))))
    } : {minDate: new Date(), maxDate: new Date()};

    return (
        <Calendar
            date={new Date()}
            onChange={handleSelect}
            dayContentRenderer={renderDayContent}
            disabledDates={getDisabledDates()}
            minDate={minDate}
            maxDate={maxDate}
        />
    );
};

export default HistoryDatePicker;
