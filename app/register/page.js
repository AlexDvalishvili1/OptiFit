import AuthForm from "../../components/Forms/AuthForm";

const Register = () => {
    return (
        <AuthForm action={"register"} title={"Register"} button={"Sign Up"}
                  advanced={{question: ["Already have an account?", "/login"]}}/>
    );
};
export default Register;