import './DietPlan.css';
import MealMacros from "@/components/Diet/MealMacros";

const MealFood = ({data, index}) => {
    return (
        <div className={"meal-food"}>
            <div className="meal-food__name">{index + 1 + ". "} {data?.name}: {data?.serving}</div>
            <MealMacros data={data} className={"meal-food__macros"}/>
        </div>
    );
};

export default MealFood;