import React, { useState } from 'react'
import { Link } from "react-router-dom"
import Checkbox from '@mui/material/Checkbox';
import img from "../../../assets/images/gift-amico.png"
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { CircularProgress } from '@mui/material';

const RegisterUI = ({
    handleRegister,
    user,
    updateState,
    isLoading
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showCpassword, setShowCpassword] = useState(false);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="md:flex w-full max-w-full bg-white shadow-lg overflow-hidden">
                {/* Left Side */}
                <div className="md:flex hidden w-1/2 bg-purple-50  p-10 flex-col justify-between">
                    <img
                        src={img}
                        alt="Chart"
                        className="mb-10 w-[70%] mx-auto"
                    />
                    <div className="mt-0">
                        <p className="text-gray-600 font-semibold">Durgesh</p>
                        <p className="text-[--active-purple-color]">Founder of Nano chat</p>
                    </div>
                </div>

                {/* Right Side */}
                <div className="md:w-1/2 w-full px-10 py-10">
                    <h2 className="md:text-3xl text-xl font-semibold mb-6 text-[--active-text-color]">Create Your Account</h2>
                    <form>
                        <div className="mb-4">
                            <label className="block text-[--active-text-color] font-semibold mb-2" htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Sholifur Rahman"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                onChange={(e) => updateState({ name: e.target.value })}
                                value={user.name}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-[--active-text-color] font-semibold mb-2" htmlFor="email">Email address</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="sholifur34@company.com"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                onChange={(e) => updateState({ email: e.target.value })}
                                value={user.email}
                            />
                        </div>

                        <div className="mb-4 w-full relative">
                            <label className="block text-[--active-text-color]">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="at least 8 characters"
                                className="w-full p-2 border border-gray-300 rounded mt-2 pr-10"
                                value={user.password}
                                name='password'
                                onChange={(e) => updateState({ password: e.target.value })}
                            />
                            <div
                                className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-[--active-text-color] text-lg cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </div>
                        </div>

                        <div className="mb-4 w-full relative">
                            <label className="block text-[--active-text-color]">Confirm Password</label>
                            <input
                                type={showCpassword ? 'text' : 'password'}
                                placeholder="at least 8 characters"
                                className="w-full p-2 border border-gray-300 rounded mt-2 pr-10"
                                value={user.cpassword}
                                name='password'
                                onChange={(e) => updateState({ cpassword: e.target.value })}
                            />
                            <div
                                className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-[--active-text-color] text-lg cursor-pointer"
                                onClick={() => setShowCpassword(!showCpassword)}
                            >
                                {showCpassword ? <FaEye /> : <FaEyeSlash />}
                            </div>
                        </div>

                        <div className="mb-6 flex items-center">
                            <Checkbox defaultChecked
                                sx={{
                                    color: "#7C3AED",
                                    '&.Mui-checked': {
                                        color: "#7C3AED",
                                    },
                                }}
                                value={user.checked}
                                onChange={(event) => updateState({ checked: event.target.checked })}
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-[--active-text-color]">
                                I agree to the <span className="text-[--active-purple-color]">Terms & Conditions</span>
                            </label>
                        </div>

                        <button onClick={(e) => handleRegister(e)} className="w-full bg-[--active-purple-color] text-white p-3 rounded-full">
                            {isLoading && <CircularProgress color='white' size={12} />}
                            Submit
                        </button>
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="text-[--active-purple-color]">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterUI
