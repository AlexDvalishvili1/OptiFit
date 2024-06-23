"use client";
import Input from "@mui/material/Input";
import {useState, useEffect} from "react";

const SetBar = ({index, sets, setSets, historyCheck}) => {
    const keys = Object.keys(sets[0]);
    const [value, setValue] = useState(sets[index][keys[0]]);
    const [weight, setWeight] = useState(sets[index].weight !== undefined ? sets[index].weight : 0);

    useEffect(() => {
        setValue(sets[index][keys[0]]);
        setWeight(sets[index].weight !== undefined ? sets[index].weight : 0);
    }, [sets, index, keys]);

    const handleValueChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        setSets(prevSets => {
            const updatedSets = [...prevSets];
            updatedSets[index][keys[0]] = newValue === '' ? '' : Number(newValue);
            return updatedSets;
        });
    };

    const handleWeightChange = (e) => {
        const newWeight = e.target.value;
        setWeight(newWeight === '' ? '' : Number(newWeight));
        setSets(prevSets => {
            const updatedSets = [...prevSets];
            updatedSets[index].weight = newWeight === '' ? '' : Number(newWeight);
            return updatedSets;
        });
    };

    return (
        <tr className="notebook__setbar">
            <td>{index + 1}</td>
            <td className="notebook__setbar-data">
                <Input
                    type="number"
                    name={keys[0]}
                    disabled={historyCheck}
                    error={value === '' || value < 0}
                    value={value}
                    onChange={handleValueChange}
                    inputProps={{min: 0, style: {textAlign: 'center'}}}
                />
            </td>
            {keys.length > 1 && (
                <td className="notebook__setbar-data">
                    <Input
                        type="number"
                        name="weight"
                        disabled={historyCheck}
                        error={weight === '' || weight < 0}
                        value={weight}
                        onChange={handleWeightChange}
                        inputProps={{min: 0, style: {textAlign: 'center'}}}
                    />
                </td>
            )}
        </tr>
    );
};

export default SetBar;
