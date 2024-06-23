import {Outfit} from "next/font/google";
import "./nullstyle.css";
import "./globals.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Provider from "../components/Providers";
import React from "react";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const outfit = Outfit({subsets: ["latin"]});

export const metadata = {
    title: "OptiFit",
    description: "Build yourself with - OptiFit",
};

export default async function RootLayout({children}) {
    return (
        <html lang="en">
        <body className={outfit.className}>
        <Provider>
            <Header/>
            <main>
                {children}
            </main>
            <Footer/>
        </Provider>
        </body>
        </html>
    );
}