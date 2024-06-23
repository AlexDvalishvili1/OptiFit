import DateOfBirthInput from "./DateOfBirthInput";
import HeightWeightInput from "./HeightWeightInput";
import GenderInput from "./GenderInput";
import ActivitySelect from "./ActivitySelect";
import GoalSelect from "./GoalSelect";
import AllergiesCheckbox from "../../components/Forms/AllergiesCheckbox";
import FormButton from "../../components/Forms/FormButton";
import CircularProgress from "@mui/material/CircularProgress";
import Form from "../../components/Forms/Form";
import ErrorMessage from "../ErrorMessage";

const AccountForm = ({
                         loadingData, dob, setDob, dateError, height, setHeight, heightError,
                         weight, setWeight, weightError, gender, setGender, genderError, activity,
                         setActivity, activityError, goal, setGoal, goalError, allergies, setAllergies,
                         errorMessage, successMessage, handleFormSubmit, savingData
                     }) => {
    return (
        <Form getFormData={handleFormSubmit} title={"My Account"}
              style={loadingData ? {
                  minHeight: 500,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
              } : {}}
              button={"Sign Up"}>
            {loadingData ? <CircularProgress size={60} /> : <>
                <div className={"form-item account__row"}>
                    <DateOfBirthInput dob={dob} setDob={setDob} dateError={dateError} />
                    <HeightWeightInput
                        height={height} setHeight={setHeight}
                        weight={weight} setWeight={setWeight}
                        heightError={heightError} weightError={weightError}
                    />
                </div>
                <AllergiesCheckbox onAllergiesChange={setAllergies} value={allergies} />
                <GenderInput gender={gender} setGender={setGender} genderError={genderError} />
                <ActivitySelect activity={activity} setActivity={setActivity} activityError={activityError} />
                <GoalSelect goal={goal} setGoal={setGoal} goalError={goalError} />
                <ErrorMessage message={errorMessage || successMessage} success={successMessage} />
                <FormButton title={"Save"} loading={savingData}/>
            </>}
        </Form>
    );
};

export default AccountForm;
