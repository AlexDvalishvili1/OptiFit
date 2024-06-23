export const errorCatcher = (
    value,
    message,
    setErrorMessage,
    setDateError,
    setWeightError,
    setHeightError,
    setGenderError,
    setActivityError,
    setGoalError,
    setSuccessMessage
) => {
    if (value === "reset") {
        setDateError("");
        setWeightError("");
        setHeightError("");
        setGenderError("");
        setActivityError("");
        setGoalError("");
        setSuccessMessage("");
        return;
    }

    switch (value[0]) {
        case "error":
            setErrorMessage(message);
            break;
        case "dob":
            setDateError(message);
            break;
        case "weight":
            setWeightError(message);
            break;
        case "height":
            setHeightError(message);
            break;
        case "gender":
            setGenderError(message);
            break;
        case "activity":
            setActivityError(message);
            break;
        case "goal":
            setGoalError(message);
            break;
        default:
            setErrorMessage("Unknown error");
            break;
    }
};
