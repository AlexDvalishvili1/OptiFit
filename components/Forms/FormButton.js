import React from 'react';
import Button from "@/components/Button";
import Colors from "@/app/colors";
import {CircularProgress} from "@mui/material";

const FormButton = ({title, type, onClick, loading}) => {
    return (
        <div className="form-item form__button">
            <Button type={type} onClick={onClick} link={""} title={title} variant={Colors.styles.black} loading={loading}/>
        </div>
    );
};

export default FormButton;