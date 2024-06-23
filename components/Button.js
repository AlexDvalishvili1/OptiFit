"use client"

import Image from "next/image";
import React, {useState} from "react";
import Link from "next/link";
import {CircularProgress} from "@mui/material";

export const OnlyButton = ({children, className, reactIcon, type, title, icon, variant, onClick, loading}) => {
    const [hover, setHover] = useState(false);
    const disabledStyles = loading ? {
        cursor: "not-allowed",
        backgroundColor: variant.hover.backgroundColor,
    } : {};
    return (
        <button className={className} disabled={loading} onClick={onClick} onMouseEnter={() => {
            setHover(true)
        }}
                onMouseLeave={() => {
                    setHover(false)
                }}
                style={variant ? {
                    width: "100%",
                    color: variant.color,
                    backgroundColor: hover ? variant.hover.backgroundColor : variant.backgroundColor,
                    ...disabledStyles,
                } : {width: "100%"}}
                type={type}
        >
            {children}
            {icon && <Image src={icon} alt={title ? title : "Icon"} width={24} height={24}/>}
            {reactIcon}
            {title}
            {loading && <CircularProgress size={20} color={"inherit"} style={{margin: "0 0 0 3px"}}/>}
        </button>
    );
}

const Button = ({children, className, type, title, icon, reactIcon, variant, link, onClick, loading}) => {
    return (
        <>
            {link ?
                <Link onClick={onClick} href={link} className={className}><OnlyButton type={type} reactIcon={reactIcon}
                                                                                      title={title}
                                                                                      icon={icon}
                                                                                      variant={variant} loading={loading}/></Link> :
                <OnlyButton className={className} onClick={onClick} children={children} type={type}
                            reactIcon={reactIcon} title={title}
                            icon={icon}
                            variant={variant} loading={loading}/>}
        </>

    );
};

export default Button;