import React from "react";
import './BuildYourself.css';
import Container from "@/components/Container";
import Image from "next/image";

function BuildYourself() {
    return (
        <div className="build-yourself">
            <Container>
                <div className="build-yourself__content">

                    <div className="build-yourself__title">Build<br/>Yourself<br/>With -<br/>OptiFit<span>.</span>
                    </div>
                    <div className="build-yourself__img">
                        <Image src="/food.png" alt="Food" width={1720} height={1105} priority={true}/>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default BuildYourself;