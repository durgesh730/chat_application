import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import { useNavigate } from 'react-router-dom';
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../../context/AuthContext';

export default function SideDrawer({ open, setOpen }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [active, setActive] = React.useState("Dashboard")

    const DrawerList = (
        <Box sx={{ overflow: "auto" }}>
            <div className='py-6'>
                <img
                    className="object-cover w-20 h-20 p-1 mx-auto rounded-full ring-2 ring-indigo-300 dark:ring-indigo-500"
                    src={user?.profile_image}
                    alt="Bordered avatar"
                />
                <h1 className='text-center pt-4  text-md font-semibold ' >{user?.firstName + " " + user?.lastName}</h1>
            </div>
            <Divider />
            <List>
                <ListItem className={` ${active == "Dashboard" ? "bg-[--active-purple-color]" : "bg-white"}`} disablePadding>
                    <ListItemButton
                        onClick={() => {
                            setActive("Dashboard");
                            navigate('/');
                        }}
                    >
                        <DashboardIcon className={` ${active == "Dashboard" ? "text-white" : "text-gray-600"}`} />
                        <ListItemText primary={"Dashboard"} className={` ${active == "Dashboard" ? "text-white" : "text-gray-600"} pl-2`} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Drawer open={open} onClose={() => setOpen(false)}>
            {DrawerList}
        </Drawer>
    );
}