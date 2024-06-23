"use client";
import './Header.css';
import Container from "../Container.js";
import Link from "next/link";
import Image from "next/image";
import SignInButton from "./SignInButton";
import Button from "../Button";
import React, {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import GoogleTranslate from "../GoogleTranslate";
import {IoRestaurant} from "react-icons/io5";
import {FaDumbbell} from "react-icons/fa";
import BugerMenu from "./BurgerMenu";
import Colors from "../../app/colors";
import windowSize from "../WindowSize";

const Header = () => {
    const {data, status} = useSession();
    const [dropContent, setDropContent] = useState(false);
    const dropdownRef = useRef(null);
    const screenSize = windowSize();

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
        <header className="header">
            <Container>
                <nav className="header__navbar">
                    <div className="header__navbar-logo">
                        <Link href="/">
                            <Image src="/logo.svg" alt="Logo" width={200} height={43} priority={true}/>
                        </Link>
                    </div>
                    <ul className="header__navbar-menu">
                        <li className="header__navbar-item">
                            <GoogleTranslate/>
                        </li>
                        {screenSize.width < 768 && data && data.user ?
                            <BugerMenu/>
                            : <>
                                {data && data.user && (<>
                                        <li>
                                            <Button
                                                variant={Colors.styles.purple}
                                                type="button"
                                                reactIcon={<IoRestaurant/>}
                                                title="Diet"
                                                link="/diet"
                                            />
                                        </li>
                                        <li>
                                            <div className="dropdown" ref={dropdownRef}>
                                                <Button
                                                    onClick={() => setDropContent(!dropContent)}
                                                    variant={Colors.styles.purple}
                                                    type="button"
                                                    reactIcon={<FaDumbbell/>}
                                                    title="Workout"
                                                />
                                                <div id={"workout__dropdown"} className="dropdown-content"
                                                     style={dropContent ? {
                                                         display: "flex",
                                                         flexDirection: "column"
                                                     } : {}}>
                                                    <Link href={"/workout"} onClick={() => setDropContent(false)}>Create
                                                        Plan</Link>
                                                    <Link onClick={() => setDropContent(false)}
                                                          href={"/workout/history"}>Workout History</Link>
                                                    <Link id="start-workout" onClick={() => setDropContent(false)}
                                                          href={"/workout/notebook"}>Start Workout</Link>
                                                </div>
                                            </div>
                                        </li>
                                    </>
                                )
                                }
                                <li className="header__navbar-item">
                                    <SignInButton/>
                                </li>
                            </>}
                    </ul>
                </nav>
            </Container>
        </header>
    )
};

export default Header;