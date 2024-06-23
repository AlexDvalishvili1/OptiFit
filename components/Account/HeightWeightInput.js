import { InputNumber } from "../../components/Forms/Inputs";

const HeightWeightInput = ({ height, setHeight, weight, setWeight, heightError, weightError }) => {
    return (
        <div className={"account__hw"}>
            <InputNumber
                error={heightError}
                value={height}
                label={"Height*"}
                text={"cm"}
                name={"height"}
                onChange={setHeight}
            />
            <InputNumber
                error={weightError}
                value={weight}
                label={"Weight*"}
                text={"kg"}
                name={"weight"}
                onChange={setWeight}
            />
        </div>
    );
};

export default HeightWeightInput;
