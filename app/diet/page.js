"use client";
import React, {useEffect, useState} from "react";
import Generator from "../../components/Generator/Generator";

const Diet = () => {
    const [resultText, setResultText] = useState();
    const [loading, setLoading] = useState();
    const [chat, setChat] = useState(false);
    const [userModifications, setUserModifications] = useState();
    const [error, setError] = useState(false);
    const [history, setHistory] = useState(false);
    const [diets, setDiets] = useState();
    const [chosenDate, setChosenDate] = useState("today");
    const [loadingData, setLoadingData] = useState(true);
    const [diet, setDiet] = useState();

    async function getDiet(date) {
        setLoadingData(true);
        setHistory(false);
        setDiet(false);
        setChosenDate(date.toLowerCase());
        if (date.toLowerCase() === "today") {
            date = new Date();
        }
        let response;
        try {
            response = await fetch(`${window.location.origin}/api/diet/get`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({date}),
            });
            response = await response.json();
        } catch (err) {
        }
        if (response?.result) {
            setDiet(response.result);
            setResultText(response.result);
            setChat(true);
        } else {
            setResultText(null);
            setChat(null);
        }
        setLoadingData(false);
    }

    async function getDietsHistory() {
        let response;
        try {
            response = await fetch(`${window.location.origin}/api/diet/history`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });
            response = await response.json();
        } catch (err) {
        }
        if (response?.result) {
            setDiets(response.result);
        }
    }

    useEffect(() => {
        getDiet("today");
    }, []);

    useEffect(() => {
        getDietsHistory();
    }, [history === true]);

    async function generateDiet() {
        let response;
        try {
            setError(false);
            setLoading(true);
            if (diet && Boolean(userModifications) === false) {
                setError("Fill field");
            } else {
                response = await fetch(`${window.location.origin}/api/diet/generate`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({userModifications}),
                });
                response = await response.json();
            }
        } catch (err) {
            throw Error(err);
        }
        if (response?.error) {
            setError(response.error);
        }
        if (response?.result) {
            setDiet(response.result);
            setChat(true);
        }
        if (response?.message) {
            setDiet(false);
            setResultText(response.message);
        }
        setUserModifications("");
        setLoading(false);
    }

    return (
        <Generator buttonLink={"/diet"} title={"Diet:"} getButtonTitle={"Get Diet"}
                   textareaPlaceholder={"Type changes (e.g Avocado is expensive,change it with something else)"}
                   generatePlan={generateDiet} getDietsHistory={getDietsHistory} diets={diets}
                   chosenDate={chosenDate} loadingData={loadingData} diet={diet ? JSON.parse(diet) : false}
                   setHistory={setHistory} userModifications={userModifications}
                   setUserModifications={setUserModifications}
                   history={history} getPlan={getDiet} loading={loading} resultText={resultText} error={error}
                   chat={chat}/>
    );
};

export default Diet;