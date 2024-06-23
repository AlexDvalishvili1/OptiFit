"use client";
import IconButton from '@mui/material/IconButton';
import {MdAddCircle, MdRemoveCircle} from "react-icons/md";
import {green, red} from '@mui/material/colors';
import {useContext, useEffect, useState, useCallback} from "react";
import SetBar from "./SetBar";
import {NotebookContext} from "@/components/NotebookContext";

const Sets = ({data, exerciseIndex, historyCheck}) => {
    const {day, setDay} = useContext(NotebookContext);

    const getDefaultSet = useCallback(() => {
        let value;

        if (!isNaN(data.reps)) {
            value = Number(data.reps);
        } else if (data.reps.toString().includes("-")) {
            const numbers = data.reps.toString().split(/[- ]/);
            const filteredNumbers = numbers.map(Number).filter(n => !isNaN(n));
            const sum = filteredNumbers.reduce((acc, num) => acc + num, 0);
            value = Math.trunc(sum / filteredNumbers.length);
        } else {
            value = 0;
        }

        const isTimeBased = data.reps.toString().includes("minutes") || data.reps.toString().includes("seconds");
        if (isTimeBased) {
            if (data.reps.toString().includes("minutes")) {
                return {minutes: value};
            } else {
                return {seconds: value};
            }
        }

        return {reps: value, weight: 0};
    }, [data]);

    const initializeSets = useCallback(() => {
        const array = [];
        for (let i = 0; i < data.sets; i++) {
            array.push(getDefaultSet());
        }

        setDay(prev => {
            const updatedDay = {...prev};
            updatedDay.exercises[exerciseIndex].data = array;
            return updatedDay;
        });

        return array;
    }, [data, exerciseIndex, setDay, getDefaultSet]);

    const [sets, setSets] = useState(historyCheck ? data?.data : initializeSets);

    useEffect(() => {
        setDay(prev => {
            const updatedDay = {...prev};
            updatedDay.exercises[exerciseIndex].data = sets;
            return updatedDay;
        });
    }, [sets, exerciseIndex, setDay]);

    useEffect(() => {
        if (!historyCheck) {
            const initialSets = initializeSets();
            setSets(initialSets);
            setDay(prev => {
                const updatedDay = {...prev};
                updatedDay.exercises[exerciseIndex].data = initialSets;
                return updatedDay;
            });
        }
    }, [initializeSets, exerciseIndex, setDay]);

    const handleRemoveSet = () => {
        if (sets.length > 1) {
            setSets(prevSets => prevSets.slice(0, -1));
        }
    };

    const handleAddSet = () => {
        setSets(prevSets => [...prevSets, getDefaultSet()]);
    };

    return (
        <>
            <div className="notebook__sets" style={historyCheck ? {justifyContent: "flex-start"} : {}}>
                <table style={historyCheck ? {width: "100%"} : {}}>
                    <thead>
                    <tr>
                        <th>Set</th>
                        {Object.keys(sets[0]).map((value, index) => (
                            <th key={index}>{value.charAt(0).toUpperCase() + value.slice(1)}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {sets.map((set, index) => (
                        <SetBar
                            key={index}
                            historyCheck={historyCheck}
                            sets={sets}
                            index={index}
                            setSets={setSets}
                        />
                    ))}
                    </tbody>
                </table>
            </div>
            {!historyCheck && (
                <div className="notebook__sets-buttons">
                    <IconButton size="large" onClick={handleRemoveSet}>
                        <MdRemoveCircle size={40} color={red[500]}/>
                    </IconButton>
                    <IconButton size="large" onClick={handleAddSet}>
                        <MdAddCircle size={40} color={green[500]}/>
                    </IconButton>
                </div>
            )}
        </>
    );
};

export default Sets;
