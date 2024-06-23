import ExerciseCard from "./ExerciseCard";
import './Notebook/Program.css';
import Colors from "../../app/colors";
import Button from "@/components/Button";

const PlanDay = ({data, onlyMuscles, dayHandler}) => {
    return (
        !onlyMuscles ? (
            <div className={"exercise__day"}>
                <h3 className="exercise__day-title">{data?.day}</h3>
                {!data?.rest ? (
                    <>
                        <h4 className="exercise__day-subtitle">{data?.muscles}</h4>
                        {data?.exercises?.map((exercise, index) => (
                            <ExerciseCard key={index} data={exercise}/>
                        ))}
                    </>
                ) : (
                    <div className={"exercise__day-subtitle"}>Rest Day</div>
                )}
            </div>) : (
            <div className={"exercise__day"}>
                <h4 className="exercise__day-subtitle"
                    style={onlyMuscles ? {color: Colors.color} : {}}>{data?.day}</h4>
                <Button className={"exercise__day-btn"} onClick={() => dayHandler(data)}>
                    <h4 className="exercise__day-subtitle"
                        style={onlyMuscles ? {color: Colors.bg_color} : {}}>{data?.muscles}</h4>
                </Button>
            </div>)
    );
};

export default PlanDay;