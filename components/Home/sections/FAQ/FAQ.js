import React from "react";
import './FAQ.css';
import Container from "@/components/Container";

function FAQ() {
    return (
        <div className="faq">
            <Container>
                <div className="faq__content">
                    <div className="faq__title start__title"><h2>You’ve got questions, we’ve got answers!</h2></div>
                    <ul className="faq__questions">
                        <li className="faq__question-item">
                            <div className="faq__question-title">What are the three goals I can choose?</div>
                            <div className="faq__question-text">The three selectable goals tune the AI’s suggestions
                                accordingly - whether you’re aiming for Weight Loss, Muscle Gain or Balanced Nutrition.
                                What’s your pick for the day?
                            </div>
                        </li>
                        <li className="faq__question-item">
                            <div className="faq__question-title">How to pick a daily or weekly ration and workout plan?</div>
                            <div className="faq__question-text">Your AI Assistant will help you sort daily or weekly meal
                                rations and workout plans based on your preferences and goals. Now, isn’t that simple and hassle-free?
                            </div>
                        </li>
                        <li className="faq__question-item">
                            <div className="faq__question-title">Can I change my ration and workout choice later?</div>
                            <div className="faq__question-text">Of course! You’re the master of your meals and workouts!
                                Feel free to change your ration and workout choices whenever you want.
                            </div>
                        </li>
                        <li className="faq__question-item">
                            <div className="faq__question-title">What is the Notebook feature?</div>
                            <div className="faq__question-text">The Notebook feature allows you to start workouts and
                                save sets, reps, and weights that you did. Track your progress and stay motivated by
                                logging your activities and monitoring your improvement over time!
                            </div>
                        </li>
                    </ul>
                </div>
            </Container>
        </div>
    );
}

export default FAQ;