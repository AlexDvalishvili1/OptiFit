"use client";

import {signOut, useSession} from "next-auth/react";
import Button, {OnlyButton} from "../Button";
import Colors from "../../app/colors";
import React, {useEffect, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import './SiginButton.css'
import Link from "next/link";

const SignInButton = () => {
    const router = useRouter();
    const pathname = usePathname();
    const {data} = useSession();
    const [dropContent, setDropContent] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropContent(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <>
            {data && data.user ?
                <div className="dropdown" ref={dropdownRef}>
                    <OnlyButton onClick={() => setDropContent(!dropContent)}
                                className={"dropbtn"}
                                type="button"
                                icon="/user.svg"
                                variant={Colors.styles.purple}
                    />
                    <div className="dropdown-content"
                         style={dropContent ? {display: "flex", flexDirection: "column"} : {}}>
                        <Link href={"/account"} onClick={() => setDropContent(false)}>My Account</Link>
                        <Link onClick={() => {
                            signOut();
                            router.push('/');
                        }} className={"logout"} href={"#"}>Logout</Link>
                    </div>
                </div> : <>
                    {pathname === "/login" ? <Button
                        type="button"
                        icon="/user.svg"
                        title="Register"
                        link="/register"
                        variant={Colors.styles.purple}
                    /> : <Button
                        type="button"
                        icon="/user.svg"
                        title="Login"
                        link="/login"
                        variant={Colors.styles.purple}
                    />}
                </>}
        </>
    );
};

export default SignInButton;