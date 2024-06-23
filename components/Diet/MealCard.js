import './DietPlan.css';
import MealFood from "@/components/Diet/MealFood";

const MealCard = ({data}) => {
    return (
        <div className={"meal__card"}>
            <div className="meal__name">{data?.name}</div>
            <div className="meal__foods">
                {data && data.foods.map((food, index) => <div key={index}><MealFood index={index} data={food}/></div>)}
            </div>
        </div>
    );
};

export default MealCard;