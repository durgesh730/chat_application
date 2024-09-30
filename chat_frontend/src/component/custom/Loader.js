import React from 'react'
import { CircularProgress } from '@mui/material'

const Loader = () => {
    return (
        <div className='text-center pt-64'>
            <CircularProgress size={30} color="secondary" />
        </div>
    )
}

export default Loader
