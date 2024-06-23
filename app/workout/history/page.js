"use client";
import React, {useEffect, useState} from "react";
import Container from "@/components/Container";
import './History.css';
import HistoryCircle from "@/components/Workout/History/HistoryCircle";
import Button from "../../../components/Button";
import Colors from "../../colors";
import {IoIosArrowDown, IoIosArrowUp} from "react-icons/io";
import "react-date-range/dist/styles.css";
import HistoryDatePicker from "@/components/Workout/History/HistoryDatePicker";
import {CircularProgress} from "@mui/material";
import HistoryDayDialog from "@/components/Workout/History/HistoryDayDialog";

const History = () => {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);
    const [viewAll, setViewAll] = useState(false);
    const [selected, setSelected] = useState(null);

    const getWorkoutsHistory = async () => {
        let response;
        try {
            response = await fetch(`${window.location.origin}/api/workout/get/history`, {
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
            setHistory(response.result);
        }
        setLoading(false);
    };

    useEffect(() => {
        getWorkoutsHistory();
    }, []);

    return (
        <Container>
            <div className="workout-history">
                <h2 className="workout-history__title">Workout History:</h2>
                <p className="workout-history__subtitle">{!viewAll ? "Current week" : "All workouts"}</p>
                <div>
                    <Button title={viewAll ? "Hide All" : "View All"}
                            reactIcon={viewAll ? <IoIosArrowUp/> : <IoIosArrowDown/>} variant={Colors.styles.grey}
                            onClick={() => setViewAll(!viewAll)}/>
                </div>
                {loading ? <CircularProgress size={60}/> : <>
                    {viewAll ?
                        <HistoryDatePicker history={history} setSelected={setSelected}/>
                        :
                        <HistoryCircle history={history} setSelected={setSelected}/>
                    }
                </>}
                <HistoryDayDialog open={selected} setOpen={setSelected} workout={selected}/>
            </div>
        </Container>
    );
};

export default History;
