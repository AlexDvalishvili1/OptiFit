import './DietPlan.css';

const MealMacros = ({data, className}) => {
    return (
        <div className={`${className} macros`}>
            <div className={`${className}__calories calories`}>
                <div className={`${className}__calories-value`}>{data?.calories}</div>
                <div className={`${className}__calories-title macros__title`}>Calories</div>
            </div>
            <div className={`${className}__proteins proteins`}>
                <div className={`${className}__proteins-value`}>{data?.protein}</div>
                <div className={`${className}__proteins-title macros__title`}>Proteins</div>
            </div>
            <div className={`${className}__carbohydrates carbohydrates`}>
                <div className={`${className}__carbohydrates-value`}>{data?.carbohydrates}</div>
                <div className={`${className}__carbohydrates-title macros__title`}>Carbs</div>
            </div>
            <div className={`${className}__fats fats`}>
                <div className={`${className}__fats-value`}>{data?.fat}</div>
                <div className={`${className}__fats-title macros__title`}>Fats</div>
            </div>
        </div>
    );
};

export default MealMacros;