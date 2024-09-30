import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SearchInput from "../../custom/SearchInput";
import { useGetAllUser } from "../../../hooks/auth/auth";
import { useAuth } from "../../../context/AuthContext";

const drawerWidth = 340;
export default function SideDrawer() {
    const [active, setActive] = React.useState("allStocks")
    const { state } = useGetAllUser()
    const { setReceiver } = useAuth()
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
                <Box sx={{ overflow: "auto" }}>
                    <div className=" px-4 py-2">
                        <SearchInput />
                    </div>
                    <List>
                        {state && state.data.map((item, index) => {
                            return (
                                <ListItem className={` ${active == index ? "bg-[--active-purple-color]" : "bg-white"} rounded-r-md`} disablePadding>
                                    <ListItemButton onClick={() => { setReceiver(item); setActive(index) }}>
                                        {/* <WarehouseIcon className={` ${active == index ? "text-white" : "text-gray-600"}`} /> */}
                                        <ListItemText primary={item.name} className={` ${active == index ? "text-white" : "text-gray-600"} pl-2`} />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>
                </Box>
            </Box>
        </>
    );
}
