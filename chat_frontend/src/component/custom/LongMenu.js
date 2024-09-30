import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Divider, IconButton } from '@mui/material';

const LongMenu = React.memo(({ options, handleOptions }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ cursor: "pointer" }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {options.map((option) => (
          <React.Fragment key={option.id}>
            <MenuItem
              onClick={() => {
                handleClose();
                handleOptions && handleOptions(option);
              }}
              style={{ color: option.color }}
            >
              {option.icon && <span className='px-2'>{option.icon}</span>}
              {option.title || option}
            </MenuItem>
            {option.line && <Divider />}
          </React.Fragment>
        ))}
      </Menu>
    </div>
  );
});

export default LongMenu;
