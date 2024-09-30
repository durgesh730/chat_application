import React from 'react'
import Checkbox from '@mui/material/Checkbox';
import { FormControlLabel } from '@mui/material';

const ColorCheckBox = ({
    label,
    handleCheckBox,
    handleChange
}) => {
    return (
        <FormControlLabel
            className=' p-0 m-0'
            label={label}
            control={
                <Checkbox
                    sx={{
                        color: "#7C3AED",
                        '&.Mui-checked': {
                            color: "#7C3AED",
                        },
                    }}
                    onChange={(event)=>handleChange(event, label)}
                    // onClick={() => handleCheckBox(label)}
                />
            }
        />
    )
}

export default ColorCheckBox
