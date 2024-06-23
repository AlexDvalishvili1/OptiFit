import React from 'react';
import Appendix from "./Appendix/Appendix.js";
import {FaFacebook, FaInstagram, FaTwitter, FaDiscord} from "react-icons/fa";
import './Footer.css'
import colors from "@/app/colors";

const Footer = () => (
    <footer className="footer">
        <ul id="contacts" className="footer__medias">
            <li className="footer__medias-item"><a href="https://twitter.com/AlexDvalishvili">
                <FaTwitter color={colors.color}/>
            </a>
            </li>
            <li className="footer__medias-item"><a href="https://www.facebook.com/alex.dvalishviili/">
                <FaFacebook color={colors.color}/>
            </a></li>
            <li className="footer__medias-item"><a href="https://www.instagram.com/alex.dvalishvili/">
                <FaInstagram color={colors.color}/>
            </a></li>
            <li className="footer__medias-item"><a href="https://discord.gg/WAvjrqfe">
                <FaDiscord color={colors.color}/>
            </a></li>
        </ul>
        <Appendix/>
    </footer>
);

export default Footer;
