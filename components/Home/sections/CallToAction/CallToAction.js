import React from "react";
import './CallToAction.css';
import Container from "../../../Container.js";
import Button from "@/components/Button";
import Colors from "@/app/colors";

function CallToAction() {
    return (
        <div className="cta">
            <Container>
                <div className="cta__content">
                    <div className="cta__title start__title"><h2>Still unsure? Don’t hesitate! Take a step toward a
                        healthier you. Sign up now and let us guide you on a culinary adventure!</h2></div>
                    <ul className="cta__buttons">
                        <li className="cta__button">
                            <Button
                                type="button"
                                title="Sign Up Now"
                                variant={Colors.styles.purple}
                                link="/register"
                            />
                        </li>
                        <li id="more_btn" className="cta__button">
                            <Button
                                type="button"
                                title="Learn More"
                                variant={Colors.styles.white}
                            />
                        </li>
                    </ul>
                </div>
            </Container>
        </div>
    );
}

export default CallToAction;