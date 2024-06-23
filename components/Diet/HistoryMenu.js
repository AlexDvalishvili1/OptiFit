import Link from "next/link";
import React from "react";

const HistoryMenu = ({diets, getPlan}) => {
    return (
        <div id="generator__history">
            <h2 className={"generator__history-title"}>History</h2>
            <div className="generator__history-column">
                {diets === undefined || diets?.length === 0 ?
                    <p style={{padding: "0 10px"}}>Empty</p> : diets.map((diet, index) =>
                        <Link href={""}
                              key={index}
                              onClick={() => getPlan(diet)}
                              className={"generator__history-item"}>
                            <p key={index}>{diet}</p></Link>)}
            </div>
        </div>
    );
};

export default HistoryMenu;