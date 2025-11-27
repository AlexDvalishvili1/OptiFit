"use client";

import Link from "next/link";
import Colors from "../../app/colors";
import {FaGoogle, FaFacebook, FaGithub} from "react-icons/fa";
import FormButton from "./FormButton";
import {signIn} from "next-auth/react";
import ErrorMessage from "../ErrorMessage";
import {useState} from "react";
import FormAdvanced from "./FormAdvanced";
import Form from "./Form";
import {InputEmail, InputPassword} from "./Inputs";
import {useRouter} from 'next/navigation';
import {userSchema} from "@/lib/userSchema";

const AuthForm = ({action, title, button, advanced}) => {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState();
    const [emailError, setEmailError] = useState();
    const [passwordError, setPasswordError] = useState();
    const [loading, setLoading] = useState(false);

    const errorCatcher = (value, message) => {
        if (value[0] === "email") {
            setEmailError(message);
        }
        if (value[0] === "password") {
            setPasswordError(message);
        }
        if (value === "reset") {
            setEmailError("");
            setPasswordError("");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        await callApi(action, data);
    };

    const callApi = async (action, data) => {
        setLoading(true);
        errorCatcher("reset");

        const result = userSchema.safeParse(data);

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                setErrorMessage("");
                errorCatcher(issue.path, issue.message);
            });
            setLoading(false);
            return;
        }

        let response;
        if (action === "login") {
            try {
                response = await signIn("credentials", {
                    redirect: false,
                    email: result.data.email,
                    password: result.data.password,
                });
            } catch (err) {
            }
        }

        if (action === "register") {
            try {
                console.log("Password: " + result.data.password)
                response = await signIn('credentials', {
                    redirect: false,
                    email: result.data.email,
                    password: result.data.password,
                    register: true,
                });
            } catch (err) {
            }
        }

        if (response?.error) {
            setErrorMessage(response.error);
        } else {
            router.push("/account");
        }
        setLoading(false);
    };

    return (
        <Form getFormData={handleFormSubmit} title={title}>
            <InputEmail error={emailError}/>
            <InputPassword error={passwordError}/>
            <FormAdvanced checkText={advanced.text} question={advanced.question}/>
            <ErrorMessage message={errorMessage}/>
            <FormButton type={"submit"} title={button} loading={loading}/>
            <div className="form__line"><span></span>
                <p>Or continue with</p><span></span></div>
            <ul className="form__medias">
                <li className="login__medias-item">
                    <Link onClick={() => signIn("google", {
                        callbackUrl: `${window.location.origin}/account`,
                    })} href="#">
                        <FaGoogle color={Colors.styles.black.backgroundColor} size={24}/>
                    </Link>
                </li>
                <li className="login__medias-item">
                    <Link onClick={() => signIn("facebook", {
                        callbackUrl: `${window.location.origin}/account`,
                    })} href="#">
                        <FaFacebook color={Colors.styles.black.backgroundColor} size={24}/>
                    </Link>
                </li>
                <li className="login__medias-item">
                    <Link onClick={() => signIn("github", {
                        callbackUrl: `${window.location.origin}/account`,
                    })} href="#">
                        <FaGithub color={Colors.styles.black.backgroundColor} size={24}/>
                    </Link>
                </li>
            </ul>
        </Form>
    );
};

export default AuthForm;
