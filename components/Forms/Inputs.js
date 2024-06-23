import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ErrorMessage from "../ErrorMessage";

export function InputNumber({label, text, name, error, value, onChange}) {
    const handleChange = (event) => {
        const newValue = event.target.value;
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
            <div>
                <TextField
                    error={error}
                    name={name}
                    defaultValue={value}
                    label={label}
                    id="standard-start-adornment"
                    sx={{width: '100%'}}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">{text}</InputAdornment>,
                    }}
                    variant="outlined"
                    onChange={handleChange}
                />
            </div>
        </Box>
    );
}


export function InputPassword({error}) {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
            <FormControl error={error} sx={{width: '100%'}} variant="standard">
                <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
                <Input
                    id="standard-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    name={"password"}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                            >
                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                            </IconButton>
                        </InputAdornment>
                    }
                />
                <ErrorMessage message={error} padding="5px 0 0 0"/>
            </FormControl>
        </Box>
    );
}

export function InputEmail({error}) {
    return (
        <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
            <FormControl error={error} sx={{width: '100%'}} variant="standard">
                <InputLabel htmlFor="standard-adornment-email">Email</InputLabel>
                <Input
                    id="standard-adornment-email"
                    type={'text'}
                    name={"email"}
                />
                <ErrorMessage message={error} padding="5px 0 0 0"/>
            </FormControl>
        </Box>
    );
}