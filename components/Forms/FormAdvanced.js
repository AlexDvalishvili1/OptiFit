import React from 'react';
import Link from "next/link";

const FormAdvanced = ({checkText, question}) => {
    return (
        <div className="form-item form__advanced" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            {checkText &&
                <div className="form__check" style={{
                    display: "flex",
                    alignItems: "center"
                }}>
                    <input type="checkbox" name="remember" id="remember" style={{margin: "0 3px 0 0"}}/>
                    <label htmlFor="remember">{checkText}</label>
                </div>}
            <div className="form-item form__link">
                <Link href={question[1]}>{question[0]}</Link>
            </div>
        </div>
    );
};

export default FormAdvanced;