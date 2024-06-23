import {CircularProgress, LinearProgress} from "@mui/material";
import Image from "next/image";
import React from "react";
import HistoryMenu from "../Diet/HistoryMenu";
import HistoryDesktopButton from "../Diet/HistoryDesktopButton";
import TrainingPlan from "@/components/Workout/TrainingPlan";
import DietPlan from "@/components/Diet/DietPlan";

const ResultOutput = ({
                          diet,
                          loadingData,
                          plan,
                          resultText,
                          loading,
                          diets,
                          disableHistory,
                          history,
                          chosenDate,
                          setHistory,
                          getPlan,
                          screenSize
                      }) => {
    return (
        <div className={"generator__result"}
             style={loadingData || (!loading && !plan && !diet && !resultText && !history) ? {
                 display: "flex",
                 justifyContent: "center",
                 alignItems: "center",
             } : (plan ? {padding: 25} : {})}>
            {loadingData && <CircularProgress size={60}/>}
            {loading && <LinearProgress
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 3,
                    height: '4px',
                    width: '100%'
                }}/>}
            {!loadingData && !disableHistory && history &&
                <HistoryMenu diets={diets} getPlan={getPlan}/>
            }
            {!history && !loadingData &&
                (loading ? <div style={{whiteSpace: "pre-line"}}>Getting Result... (It may take few
                    minutes)</div> : (diet || plan || resultText) ?
                    <div style={{whiteSpace: "pre-line"}}>{!loading && (plan ?
                        <TrainingPlan data={plan[0]}/>
                        : (diet ? <DietPlan data={diet}/> : resultText))}</div> :
                    <Image src={"/logo_small.svg"} alt={"Optifit Logo"} width={100} height={100}
                           priority={true}/>)
            }
            {!loadingData && !disableHistory && screenSize.width >= 768 && !loading &&
                <HistoryDesktopButton history={history} getPlan={getPlan} chosenDate={chosenDate}
                                      setHistory={setHistory}/>
            }
        </div>
    );
};

export default ResultOutput;