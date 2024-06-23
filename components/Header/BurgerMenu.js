import React, {useEffect, useRef, useState} from "react";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import {IoMenu} from "react-icons/io5";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Colors from "@/app/colors";
import {IoRestaurant} from "react-icons/io5";
import {FaUser} from "react-icons/fa";
import {FaDumbbell} from "react-icons/fa";
import './Header.css';
import {signOut} from "next-auth/react";
import {IoIosArrowDown, IoIosArrowUp} from "react-icons/io";

export default function BugerMenu() {
    const [open, setState] = useState(false);
    const [dropContent, setDropContent] = useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState(open);
    };

    return (<>

        <Box component="div" sx={{
            display: {
                xs: 'none',
                sm: 'block',
            }
        }}>
        </Box>

        <button style={{backgroundColor: "transparent", padding: 0}}
                onClick={toggleDrawer(true)}
        >
            <IoMenu size={40} color={Colors.color}/>
        </button>

        <Drawer
            anchor="right"
            open={open}
            onClose={toggleDrawer(false)}
        >
            <Box sx={{
                p: 2,
                height: 1,
                backgroundColor: Colors.color,
            }}>

                <IconButton sx={{mb: 2}}>
                    <CloseIcon onClick={toggleDrawer(false)}/>
                </IconButton>

                <Divider sx={{mb: 2}}/>

                <Box sx={{mb: 2}}>
                    <ListItemButton href={"/diet"}>
                        <ListItemIcon>
                            <IoRestaurant size={25}/>
                        </ListItemIcon>
                        <ListItemText className={"burger__menu-item"} primary="Diet"/>
                    </ListItemButton>

                    <ListItemButton onClick={() => setDropContent(!dropContent)}>
                        {dropContent ?
                            <ListItemIcon>
                                <IoIosArrowUp size={25}/>
                            </ListItemIcon> :
                            <ListItemIcon>
                                <IoIosArrowDown size={25}/>
                            </ListItemIcon>
                        }
                        <ListItemText className={"burger__menu-item"} primary="Program"/>
                    </ListItemButton>
                    {dropContent && <>
                        <ListItemButton href={"/workout"}>
                            <ListItemIcon>
                                <FaDumbbell size={25}/>
                            </ListItemIcon>
                            <ListItemText className={"burger__menu-item"} primary="Create
                                Plan"/>
                        </ListItemButton>
                        <ListItemButton href={"/workout/history"}>
                            <ListItemIcon>
                                <FaDumbbell size={25}/>
                            </ListItemIcon>
                            <ListItemText className={"burger__menu-item"} primary="Workout History"/>
                        </ListItemButton>
                        <ListItemButton href={"/workout/notebook"}>
                            <ListItemIcon>
                                <FaDumbbell size={25}/>
                            </ListItemIcon>
                            <ListItemText className={"burger__menu-item"} primary="Start Workout"/>
                        </ListItemButton>
                        <Divider sx={{mb: 2}}/>
                    </>
                    }

                    <ListItemButton href={"/account"}>
                        <ListItemIcon>
                            <FaUser size={25}/>
                        </ListItemIcon>
                        <ListItemText className={"burger__menu-item"} primary="My Account"/>
                    </ListItemButton>
                </Box>

                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    position: "absolute",
                    bottom: "0",
                    left: "50%",
                    transform: "translate(-50%, 0)"
                }}
                >
                    <Button onClick={() => signOut()} variant="contained" className={"logout"}
                            sx={{m: 1, width: "100%"}}>Logout</Button>
                </Box>
            </Box>


        </Drawer>
    </>);
}