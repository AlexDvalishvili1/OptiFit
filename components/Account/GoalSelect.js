import InputSelect from "../../components/Forms/InputSelect";

const GoalSelect = ({ goal, setGoal, goalError }) => {
    return (
        <InputSelect
            error={goalError}
            name="goal"
            id="goal"
            value={goal}
            placeholder={"Goal*"}
            options={[
                ["Losing fat (Cutting)", 1],
                ["Save body shape (Maintaining)", 2],
                ["Building muscle (Bulking)", 3],
            ]}
            onChange={(e) => setGoal(e.target.value)}
        />
    );
};

export default GoalSelect;
