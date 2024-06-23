import './Notebook/Program.css';
import {useState} from "react";
import Link from "next/link";
import {IoIosArrowDown, IoIosArrowUp} from "react-icons/io";
import {FaYoutube} from "react-icons/fa";
import Colors from "../../app/colors";
import Sets from "./Sets";

const ExerciseCard = ({data, notebook, exerciseIndex, historyCheck}) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className={"exercise__card"}
             style={historyCheck ? {
                 display: "flex",
                 flexDirection: "column",
                 gap: 5,
                 borderRadius: 10,
                 padding: 10,
                 fontWeight: 600,
             } : {}}>
            <div className="exercise__name">{data?.name}</div>
            <div
                className="exercise__quantity">{data?.reps} {data?.sets && data?.sets !== "N/A" && <>x {data?.sets} sets</>}</div>
            {notebook && <>
                <hr color={Colors.bg_color}/>
                <Sets data={data} historyCheck={historyCheck} exerciseIndex={exerciseIndex}/>
            </>}
            {!historyCheck &&
                <div className="exercise__instructions" style={notebook ? {justifyContent: "center"} : {}}>
                    <button onClick={() => setExpanded(!expanded)}
                            className={"exercise__instructions-expander"}>Instructions {expanded ? <IoIosArrowUp/> :
                        <IoIosArrowDown/>}</button>
                    {data?.video && data?.video !== "N/A" &&
                        <Link href={data?.video} className="exercise__video"
                              style={{display: "flex", alignItems: "center"}}>
                            <FaYoutube size={40} color={"#ff0000"}/></Link>}
                </div>
            }
            {expanded &&
                <div className="exercise__instructions-text">
                    {data?.instructions}
                </div>
            }
        </div>
    );
};

export default ExerciseCard;