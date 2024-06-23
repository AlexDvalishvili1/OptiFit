import React from 'react';
import BuildYourself from "../components/Home/sections/BuildYourself/BuildYourself";
import Welcome from "../components/Home/sections/Welcome/Welcome";
import FAQ from "../components/Home/sections/FAQ/FAQ";
import CallToAction from "../components/Home/sections/CallToAction/CallToAction";

const Home = () => {
    return (
        <>
            <BuildYourself/>
            <Welcome/>
            <FAQ/>
            <CallToAction/>
        </>
    );
};

export default Home;