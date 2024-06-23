import Link from "next/link";
import Image from "next/image";
import React from "react";

const HistoryDesktopButton = ({history, chosenDate, getPlan, setHistory}) => {
    return (
        (!history ?
            (chosenDate !== "today" ?
                <Link href={""} className={"generator__history-btn"} onClick={() => {
                    getPlan("today")
                    setHistory(true)
                }}><Image
                    src={"/return.svg"}
                    alt={"Return to History"}
                    width={30}
                    height={30}/></Link> :
                <Link href={""} className={"generator__history-btn"} onClick={() => setHistory(true)}><Image
                    src={"/history.svg"}
                    alt={"History"}
                    width={30}
                    height={30}/></Link>)
            : <Link href={""} className={"generator__history-btn"} onClick={() => setHistory(false)}><Image
                src={"/cancel.svg"}
                alt={"Cancel History"}
                width={30}
                height={30}/></Link>)
    );
};

export default HistoryDesktopButton;