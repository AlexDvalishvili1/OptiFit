import InputSelect from "../../components/Forms/InputSelect";
import useWindowSize from "@/components/WindowSize";

const ActivitySelect = ({ activity, setActivity, activityError }) => {
    const screenSize = useWindowSize();
    const options = screenSize.width < 480 ? [
        ["Basal Metabolic Rate (BMR)", 1],
        ["Little or no exercise", 2],
        ["Exercise 1-3 times/week", 3],
        ["Exercise 4-5 times/week", 4],
        ["Exercise 6-7 times/week", 5],
    ] : [
        ["Basal Metabolic Rate (BMR)", 1],
        ["Sedentary: little or no exercise", 2],
        ["Light: exercise 1-3 times/week", 3],
        ["Moderate: exercise 4-5 times/week", 4],
        ["Very Active: intense exercise 6-7 times/week", 5],
    ];

    return (
        <InputSelect
            error={activityError}
            name="activity"
            id="activity"
            value={activity}
            placeholder={"Activity*"}
            options={options}
            onChange={(e) => setActivity(e.target.value)}
        />
    );
};

export default ActivitySelect;
