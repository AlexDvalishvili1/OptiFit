import InputRadio from "../../components/Forms/InputRadio";

const GenderInput = ({ gender, setGender, genderError }) => {
    return (
        <InputRadio
            error={genderError}
            name="gender"
            checked={gender}
            optionOne={"Male"}
            optionTwo={"Female"}
            onChange={setGender}
        />
    );
};

export default GenderInput;
