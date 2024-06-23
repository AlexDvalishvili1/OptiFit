import React from "react";
import Textarea from '@mui/joy/Textarea';
import './Generator.css';
import ErrorMessage from "../ErrorMessage";
import useWindowSize from "../WindowSize";
import Container from "../Container";
import GeneratorButtons from "./GeneratorButtons";
import ResultOutput from "./ResultOutput";

const Generator = ({
                       diet,
                       loadingData,
                       plan,
                       getButtonTitle,
                       textareaPlaceholder,
                       title,
                       disableHistory,
                       resultText,
                       loading,
                       chat,
                       error,
                       history,
                       diets,
                       generatePlan,
                       getPlan,
                       setHistory,
                       chosenDate = "today",
                       userModifications,
                       setUserModifications
                   }) => {
    const screenSize = useWindowSize();

    return (
        <Container>
            <div className="generator">
                <div className={"generator__container"}>
                    <h2 className="generator__title">{title}</h2>
                    <div className={"generator__content"}>
                        <ResultOutput disableHistory={disableHistory} resultText={resultText} loading={loading}
                                      diets={diets} getPlan={getPlan} loadingData={loadingData} diet={diet}
                                      history={history} chosenDate={chosenDate} setHistory={setHistory}
                                      screenSize={screenSize} plan={plan}/>
                        {!loadingData && !loading && <>
                            {chat && !history && chosenDate === "today" &&
                                <>
                                    <ErrorMessage message={error}/>
                                    <Textarea minRows={2} error={error}
                                              style={{backgroundColor: "transparent", width: "100%", color: "#aaaaaa"}}
                                              value={userModifications}
                                              size={screenSize.width < 480 ? "md" : "lg"}
                                              onChange={(event) => setUserModifications(event.target.value)}
                                              placeholder={textareaPlaceholder}/>
                                </>
                            }
                            <GeneratorButtons getButtonTitle={getButtonTitle} diet={diet}
                                              disableHistory={disableHistory} plan={plan} userModifications={userModifications}
                                              screenSize={screenSize} getPlan={getPlan}
                                              chosenDate={chosenDate} loading={loading}
                                              generatePlan={generatePlan} setHistory={setHistory}
                                              history={history} resultText={resultText}/></>}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default Generator;