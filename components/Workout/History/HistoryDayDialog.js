import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ExerciseCard from "@/components/Workout/ExerciseCard";
import Colors from "@/app/colors";

export default function HistoryDayDialog({workout, open, setOpen}) {
    const [scroll, setScroll] = React.useState('paper');

    const handleClose = () => {
        setOpen(false);
    };

    const descriptionElementRef = React.useRef(null);
    React.useEffect(() => {
        if (open) {
            const {current: descriptionElement} = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);

    return (
        <React.Fragment>
            <Dialog
                open={open}
                onClose={handleClose}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                PaperProps={{
                    style: {
                        backgroundColor: Colors.color
                    },
                }}
            >
                <DialogTitle
                    id="scroll-dialog-subtitle">{workout && new Date(workout[0].date).toDateString()}</DialogTitle>
                <DialogContent dividers={scroll === 'paper'} id="scroll-dialog-description"
                               ref={descriptionElementRef}
                               tabIndex={-1}
                               style={{display: "flex", flexDirection: "column", gap: 20}}>
                    {workout && (Array.isArray(workout) &&
                        workout.toReversed().map((one, index) => {
                            return <div key={index}>
                                <DialogTitle id="scroll-dialog-subtitle"
                                             style={{
                                                 padding: "16px 0 0",
                                                 fontSize: 22,
                                                 fontWeight: 600
                                             }}>{workout.length > 1 && `${index + 1}. `}{one.workout?.muscles}</DialogTitle>
                                <DialogTitle style={{
                                    padding: "16px 10px",
                                }}
                                             id="scroll-dialog-subtitle">Time: {`${one.timer?.days > 0 ? one.timer.days + ":" : ""}${
                                    one.timer?.hours > 0
                                        ? String(one.timer.hours).padStart(2, "0") + ":"
                                        : "00:"
                                }${String(one.timer?.minutes).padStart(2, "0")}:${String(
                                    one.timer?.seconds
                                ).padStart(2, "0")}`}</DialogTitle>
                                {one.workout?.exercises?.map((exercise, index) => <div key={index}>
                                    <ExerciseCard
                                        data={exercise}
                                        historyCheck={true}
                                        notebook={true}
                                        exerciseIndex={index}/></div>)}</div>
                        }))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
