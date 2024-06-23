import React, { useState, useEffect } from 'react';
import './InputRadio.css';
import Colors from "../../app/colors";

const InputRadio = ({ optionOne, optionTwo, name, error, checked, onChange }) => {
    const [selectedOption, setSelectedOption] = useState(checked);

    useEffect(() => {
        setSelectedOption(checked);
    }, [checked]);

    const handleChange = (event) => {
        const newValue = parseInt(event.target.value, 10);
        setSelectedOption(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="form-item wrapper">
            <input type="radio" name={name} id="option-1" value={1} checked={selectedOption === 1} onChange={handleChange}/>
            <input type="radio" name={name} id="option-2" value={0} checked={selectedOption === 0} onChange={handleChange}/>
            <label style={{borderColor: error && Colors.errorRed}} htmlFor="option-1" className="option option-1">
                <div className="dot"></div>
                <span>{optionOne}</span>
            </label>
            <label style={{borderColor: error && Colors.errorRed}} htmlFor="option-2" className="option option-2">
                <div className="dot"></div>
                <span>{optionTwo}</span>
            </label>
        </div>
    );
};

export default InputRadio;
