import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import Box from '@mui/material/Box';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import WarningModal from '../../custom/WarningModal';
import { useSnackbar } from '../../../context/SnackBarContext';
import SideDrawer from '../../custom/SideDrawer';

const settings = ['Profile', 'Logout'];

function NavbarUI() {
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const { showSuccess } = useSnackbar()
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [open, setOpen] = React.useState(false)
    const [isdrawerOpen, setIsDrawerOpen] = React.useState(false)

    const handleCloseUserMenu = (tab) => {
        if (tab == "Logout") {
            setOpen(true)
        } else if (tab == "Profile") {
            navigate('/profile')
        }
        setAnchorElUser(null);
    };

    const handleButtonAction = () => {
        setOpen(false)
        logout()
        showSuccess("Logout Successfully")
    }
    return (
        <>
            <AppBar position="static">
                <Container maxWidth="xl" className='bg-[--active-purple-color]'>
                    <Toolbar disableGutters className='md:px-20' >
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            Chat
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: "none" } }}>
                            <IconButton
                                onClick={() => setIsDrawerOpen(true)}
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>

                        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={(event) => setAnchorElUser(event.currentTarget)} sx={{ p: 0 }}>
                                    <Avatar alt="Remy Sharp" src={user?.profile_image} />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px', width: "700px" }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map((setting) => (
                                    <MenuItem sx={{ minWidth: "150px" }}
                                        key={setting} onClick={() => handleCloseUserMenu(setting)}>
                                        <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar >

            <WarningModal
                isOpen={open}
                onClose={() => setOpen(false)}
                btnName="Yes"
                onConfirm={handleButtonAction}
                cancelText={"Cancel"}
                isLoading={false}
                confirmText={"Yes"}
                onCancel={() => setOpen(false)}
                modalTitle={"Are your sure! You want to logout."}
            >
            </WarningModal>

            <SideDrawer setOpen={setIsDrawerOpen} open={isdrawerOpen}>
            </SideDrawer>
        </>
    );
}

export default NavbarUI;