import './DietPlan.css';
import MealCard from "@/components/Diet/MealCard";
import MealMacros from "@/components/Diet/MealMacros";

const DietPlan = ({data}) => {
    return (
        <div className={"diet-plan"}>
            {data?.message && <h3 className="diet-plan__title">{data?.message}</h3>}
            <h3 className="diet-plan__title">Daily Macronutrient Needs:</h3>
            <MealMacros data={data}/>
            <h3 className="diet-plan__title">Meal Plan:</h3>
            {data?.meals?.map((meal, index) => (
                <MealCard key={index} data={meal}/>
            ))}
        </div>
    );
};

export default DietPlan;