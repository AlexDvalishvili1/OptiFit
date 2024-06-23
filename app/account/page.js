"use client";

import * as React from 'react';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userDataSchema} from "@/lib/userSchema";
import AccountForm from "../../components/Account/AccountForm";
import './account.css';
import {errorCatcher} from "@/components/Account/errorCatcher";

const Account = () => {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState();
    const [successMessage, setSuccessMessage] = useState();
    const [dateError, setDateError] = useState();
    const [weightError, setWeightError] = useState();
    const [heightError, setHeightError] = useState();
    const [genderError, setGenderError] = useState();
    const [activityError, setActivityError] = useState();
    const [goalError, setGoalError] = useState();
    const [allergies, setAllergies] = useState();
    const [dob, setDob] = useState();
    const [height, setHeight] = useState();
    const [weight, setWeight] = useState();
    const [gender, setGender] = useState();
    const [activity, setActivity] = useState();
    const [goal, setGoal] = useState();
    const [loadingData, setLoadingData] = useState(true);
    const [savingData, setSavingData] = useState(false);

    useEffect(() => {
        getUserInfo();
    }, []);

    async function getUserInfo() {
        let response;
        try {
            response = await fetch(`${window.location.origin}/api/account`, {
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
            setDob(response.result.dob);
            setHeight(response.result.height);
            setWeight(response.result.weight);
            setGender(response.result.gender);
            setActivity(response.result.activity);
            setGoal(response.result.goal);
            setAllergies(response.result.allergies);
        }
        setLoadingData(false);
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        let formData = new FormData(e.target);
        formData = Object.fromEntries(formData.entries());
        await callApi(formData, allergies);
    };

    const callApi = async (formData, allergies) => {
        setSavingData(true);
        errorCatcher("reset", "", setErrorMessage, setDateError, setWeightError, setHeightError, setGenderError, setActivityError, setGoalError, setSuccessMessage);

        const userData = {
            dob: new Date(dob),
            height: Number(height),
            weight: Number(weight),
            gender: gender === 1,
            activity: Number(activity),
            goal: Number(goal),
            allergies: allergies ? allergies : [],
        }

        const result = userDataSchema.safeParse(userData);

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                setErrorMessage("");
                errorCatcher(issue.path, issue.message, setErrorMessage, setDateError, setWeightError, setHeightError, setGenderError, setActivityError, setGoalError, setSuccessMessage);
            });
            setSavingData(false);
            return;
        }

        let response;
        try {
            response = await fetch(`${window.location.origin}/api/save`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...result.data })
            });
            response = await response.json();
        } catch (err) {
        }

        if (response?.error) {
            errorCatcher(response.error.path, response.error.message, setErrorMessage, setDateError, setWeightError, setHeightError, setGenderError, setActivityError, setGoalError, setSuccessMessage);
            setErrorMessage(response.error.message);
        } else if (response?.message) {
            router.refresh();
            setErrorMessage("");
            setSuccessMessage(response.message);
        }
        setSavingData(false);
    };

    return (
        <AccountForm
            loadingData={loadingData}
            dob={dob} setDob={setDob} dateError={dateError}
            height={height} setHeight={setHeight} heightError={heightError}
            weight={weight} setWeight={setWeight} weightError={weightError}
            gender={gender} setGender={setGender} genderError={genderError}
            activity={activity} setActivity={setActivity} activityError={activityError}
            goal={goal} setGoal={setGoal} goalError={goalError}
            allergies={allergies} setAllergies={setAllergies}
            errorMessage={errorMessage} successMessage={successMessage}
            handleFormSubmit={handleFormSubmit} savingData={savingData}
        />
    );
};

export default Account;