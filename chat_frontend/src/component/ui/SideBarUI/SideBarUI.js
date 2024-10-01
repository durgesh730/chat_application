import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SearchInput from "../../custom/SearchInput";
import { useGetAllUser } from "../../../hooks/auth/auth";
import { useAuth } from "../../../context/AuthContext";
import EditIcon from '@mui/icons-material/Edit';
import Logout from '@mui/icons-material/Logout';
import LongMenu from "../../custom/LongMenu";
import { Drawer } from "@mui/material";
import ProfileUI from "../profileUI.js/ProfileUI";

const drawerWidth = 340;
export default function SideDrawer() {
    const [active, setActive] = React.useState("allStocks")
    const { state } = useGetAllUser()
    const { setReceiver, user , logout} = useAuth()
    const [openDrawer, setOpenDrawer] = React.useState(false)

    const handleOptions = (option) => {
        if (option.id == 1) {
            setOpenDrawer(true)
        } else if(option.id == 2){
            logout()
        }
        console.log('Selected option:', option);
    };

    const options = [
        {
            id: 1,
            title: 'Profile',
            icon: <EditIcon />,
            color: 'black',
            line: false,
        },
        {
            id: 2,
            title: 'Logout',
            icon: <Logout />,
            color: 'red',
            line: false,
        },
    ];

    return (
        <>
            <Box
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                    },
                    border: "none",
                }}
                className="border-0 "
                square
            >
                <div className="md:flex flex-row justify-center items-center px-0 py-2">
                    <LongMenu options={options} handleOptions={handleOptions} />
                    <SearchInput />
                </div>
                <Box sx={{ overflow: "auto" }}>
                    <List>
                        {state && state.data.map((item, index) => {
                            return (
                                <ListItem className={` ${active == index ? "bg-[--active-purple-color]" : "bg-white"} rounded-r-md`} disablePadding>
                                    <ListItemButton onClick={() => { setReceiver(item); setActive(index) }}>
                                        <img
                                            src={item?.profile_image}
                                            alt={item?.name || "User"}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <ListItemText primary={item.name} className={` ${active == index ? "text-white" : "text-gray-600"} pl-2`} />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>
                </Box>
            </Box>

            <Drawer PaperProps={{
                sx: { minWidth: "30%" }
            }}
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}>
                <ProfileUI profile={user} />
            </Drawer>
        </>
    );
}
