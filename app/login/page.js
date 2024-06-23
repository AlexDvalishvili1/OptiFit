import AuthForm from "../../components/Forms/AuthForm";

const Login = () => {
    return (
        <AuthForm action={"login"} title={"Login"} button={"Sign In"}
                  advanced={{text: "Remember account", question: ["Forgot password?", "#"]}}/>
    );
};

export default Login;