import React from 'react';
import './Welcome.css';
import Container from "@/components/Container";

function Welcome() {
    return (
        <div className="welcome">
            <Container>
                <div className="welcome__content">
                    <div className="welcome__title start__title"><h2>Welcome to OptiFit - Your Ultimate Fitness and Nutrition Coach!</h2></div>
                    <div className="welcome__text"><p>Dive into the exciting world of sound nutrition and effective workouts,
                        all backed by the power of Artificial Intelligence. Align your eating habits and fitness routines
                        with your health goals to achieve the balanced lifestyle you’ve always wanted. Cheers to a better, healthier you!</p>
                        <p>We at OptiFit believe there’s no such thing as a one-size-fits-all plan. Every body is unique,
                            and your diet and workouts should be too. Get ready to bid farewell to monotonous healthy meals
                            and generic workouts, and embrace the joy of personalized nutrition and fitness with smart suggestions from your AI Assistant.</p>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default Welcome;