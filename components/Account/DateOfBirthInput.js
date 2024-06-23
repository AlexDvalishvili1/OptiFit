import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { DemoItem } from '@mui/x-date-pickers/internals/demo';
import dayjs from 'dayjs';
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import Colors from "../../app/colors";

const DateOfBirthInput = ({ dob, setDob, dateError }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoItem>
                <DesktopDatePicker
                    sx={dateError && {
                        '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { border: `1px solid ${Colors.errorRed}` },
                        '.css-1jy569b-MuiFormLabel-root-MuiInputLabel-root': { color: Colors.errorRed },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: `2px solid ${Colors.errorRed}` },
                    }}
                    name={"dob"}
                    value={dayjs(dob ? new Date(dob) : new Date())}
                    label={"Date of birth*"}
                    onChange={(date) => setDob(date)}
                />
            </DemoItem>
        </LocalizationProvider>
    );
};

export default DateOfBirthInput;
