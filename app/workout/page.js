"use client";
import React, {useEffect, useState} from "react";
import Generator from "../../components/Generator/Generator";
import {useRouter} from "next/navigation";

const Workout = () => {
    const router = useRouter();
    const [resultText, setResultText] = useState();
    const [loading, setLoading] = useState();
    const [chat, setChat] = useState(false);
    const [userModifications, setUserModifications] = useState();
    const [error, setError] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    async function getProgram() {
        let response;
        try {
            response = await fetch(`${window.location.origin}/api/workout/plan/get`, {
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
            setResultText(response.result);
            setChat(true)
        } else {
            setResultText(null);
            setChat(null);
        }
        setLoadingData(false);
    }

    useEffect(() => {
        getProgram();
    }, []);

    async function generateProgram(regenerate = false) {
        let response;
        try {
            setError(false);
            setResultText("Getting result... (It can take few minutes)");
            setLoading(true);
            if (!regenerate && resultText && Boolean(userModifications) === false) {
                setError("Fill field");
            } else {
                response = await fetch(`${window.location.origin}/api/workout/plan/generate`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(!regenerate ? {userModifications} : {regenerate: true}),
                });
                response = await response.json();
            }
        } catch (err) {
            throw Error(err);
        }
        setLoading(false);
        setChat(true);
        if (response?.error) {
            setError(response.error);
        }
        setUserModifications("");
        router.refresh();
        setResultText(response?.result ? response.result : resultText);
    }

    return (
        <Generator buttonLink={"/workout"} getButtonTitle={"Get Training Workout"}
                   title={"Training Workout:"} loadingData={loadingData}
                   textareaPlaceholder={"Type changes (e.g I don't like split workout, change it to fullbody)"}
                   generatePlan={generateProgram} plan={typeof resultText === 'object' ? resultText : false}
                   resultText={resultText} userModifications={userModifications}
                   setUserModifications={setUserModifications}
                   getPlan={getProgram} loading={loading} error={error}
                   chat={chat} disableHistory={true}/>
    );
};

export default Workout;