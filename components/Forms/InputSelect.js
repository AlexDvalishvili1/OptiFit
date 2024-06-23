import React from 'react';
import './InputSelect.css';
import Colors from "../../app/colors";

const InputSelect = ({ placeholder, options, name, id, error, value, onChange }) => {
    return (
        <div className="form-item select" style={{ width: "100%", border: error ? `2px solid ${Colors.errorRed}` : undefined }}>
            <select
                name={name}
                id={id}
                value={value !== undefined ? value : ""}
                onChange={onChange}
            >
                {placeholder && <option value="" disabled hidden>{placeholder}</option>}
                {options.map((option) => (
                    <option key={option[1]} value={option[1]}>{option[0]}</option>
                ))}
            </select>
        </div>
    );
};

export default InputSelect;
