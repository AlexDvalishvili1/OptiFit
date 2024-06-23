"use client";
import Button from "../Button";
import React, {useEffect} from "react";
import HistoryMobileButton from "@/components/Diet/HistoryMobileButton";

const GeneratorButtons = ({
                              plan,
                              chosenDate,
                              disableHistory,
                              screenSize,
                              generatePlan,
                              getPlan,
                              loading,
                              history,
                              setHistory,
                              getButtonTitle,
                              resultText,
                              diet,
                              userModifications,
                          }) => {

    const keydownHandler = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) generatePlan();
    };
    useEffect(() => {
        document.addEventListener('keydown', keydownHandler);
        return () => {
            document.removeEventListener('keydown', keydownHandler);
        }
    }, [userModifications]);

    return (
        <div className="generator__buttons">
            {!history && chosenDate === "today" &&
                <Button
                    onClick={() => generatePlan()}
                    className={"btn-grad"}
                    type="button"
                    icon={"/stars.svg"}
                    title={diet || plan || resultText ? "Modify Plan" : getButtonTitle}
                />
            }
            {plan &&
                <Button
                    onClick={() => generatePlan(true)}
                    className={"btn-grad regenerate-btn"}
                    type="button"
                    icon={"/regenerate.svg"}
                    title={"Regenerate"}
                />
            }
            {!disableHistory && screenSize.width < 768 && !loading &&
                <HistoryMobileButton history={history} getPlan={getPlan} chosenDate={chosenDate}
                                     setHistory={setHistory}/>
            }
        </div>
    );
};

export default GeneratorButtons;
