import React from 'react';
import Button from "../Button";
import Colors from "../../app/colors";

const HistoryMobileButton = ({history, chosenDate, setHistory, getPlan}) => {
    return (
        (!history ?
            (chosenDate !== "today" ?
                <Button
                    onClick={() => {
                        getPlan("today")
                        setHistory(true)
                    }}
                    variant={Colors.styles.grey}
                    className={"btn-grad generator__history-lg"}
                    type="button"
                    icon={"/return.svg"}
                    title="Back"
                /> :
                <Button
                    onClick={() => setHistory(true)}
                    variant={Colors.styles.grey}
                    className={"btn-grad generator__history-lg"}
                    type="button"
                    icon={"/history.svg"}
                    title="History"
                />)
            : <Button
                onClick={() => setHistory(false)}
                variant={Colors.styles.grey}
                className={"btn-grad generator__history-lg"}
                type="button"
                icon={"/cancel.svg"}
                title="Cancel"
            />)
    );
};

export default HistoryMobileButton;