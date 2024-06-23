import {green, red} from '@mui/material/colors';

export default {
    styles: {
        purple: {
            backgroundColor: "#957BFF",
            color: "#000000",
            hover: {backgroundColor: "rgba(149,123,255,0.8)"}
        },
        white: {
            backgroundColor: "#ffffff",
            color: "#000000",
            hover: {backgroundColor: "rgba(255,255,255,0.8)"}
        },
        black: {
            backgroundColor: "#1A1A1A",
            color: "#ffffff",
            hover: {backgroundColor: "rgba(26,26,26,0.90)"}
        },
        green: {
            backgroundColor: green[500],
            color: "#000",
            hover: {backgroundColor: green[700]}
        },
        red: {
            backgroundColor: red[500],
            color: "#000",
            hover: {backgroundColor: red[700]}
        },
        grey: {
            backgroundColor: "#666",
            color: "#eee",
            hover: {backgroundColor: "rgba(102,102,102,0.7)"}
        },
        advanced: {
            color: "rgba(55, 65, 81, 0.5)"
        },
    },
    bg_color: "#1A1A1A",
    color: "#957BFF",
    errorRed: "#D32F2F",
    successGreen: "#22bb33",
}