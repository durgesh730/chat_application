import { CircularProgress } from '@mui/material'
import React from 'react'

const Button = ({ isLoading, handleSubmit, title }) => {
    return (
        <button onClick={(e) => handleSubmit(e)} className="w-full bg-[--active-purple-color] text-white py-2 px-3 rounded-md">
            {isLoading && <CircularProgress color='white' size={12} />}
            {title}
        </button>
    )
}

export default Button


