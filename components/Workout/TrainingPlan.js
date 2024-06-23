import './Notebook/Program.css';
import PlanDay from "./PlanDay";
import useWindowSize from "@/components/WindowSize";

const TrainingPlan = ({data, onlyMuscles, dayHandler}) => {
    const screenSize = useWindowSize();
    return (
        <div className={"training__plan"}
             style={onlyMuscles ? (screenSize.width > 480 ? {width: 300} : {width: "100%"}) : {width: "100%"}}>
            {onlyMuscles && <div className={"exercise__day-title"}>Choose workout:</div>}
            {data && data.map((day, index) => (
                onlyMuscles ? (!day?.rest &&
                        <PlanDay dayHandler={dayHandler} key={index} data={day} onlyMuscles={onlyMuscles}/>)
                    : <PlanDay key={index} data={day} onlyMuscles={onlyMuscles}/>
            ))}
        </div>
    );
};

export default TrainingPlan;