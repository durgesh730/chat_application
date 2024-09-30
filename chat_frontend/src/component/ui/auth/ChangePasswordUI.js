import React, { useState } from 'react'
import { Link } from "react-router-dom"
import { CircularProgress } from '@mui/material';
import img from "../../../assets/images/Forgotpassword.png"
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangePasswordUI = ({ submit, state, updateState, isLoading }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showCpassword, setShowCpassword] = useState(false);

    return (
        <div className="flex min-h-screen">
            <div className="w-full md:w-1/2 p-10 pt-24 bg-white">
                <div className="max-w-md mx-auto">
                    <h1 className="text-4xl font-bold mb-6 text-black">Change Password.</h1>
                    <p className="mb-6 text-gray-500">
                        Change Password with your data that you entered during your registration
                    </p>
                    <form>
                        <div className="mb-4 relative">
                            <label className="block text-gray-700">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="at least 8 characters"
                                className="w-full p-2 border border-gray-300 rounded mt-2 pr-10"
                                value={state.password}
                                name='password'
                                onChange={(e) => updateState({ password: e.target.value })}
                            />
                            <div
                                className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-500 text-lg cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </div>
                        </div>

                        <div className="mb-4 relative">
                            <label className="block text-gray-700">Confirm Password</label>
                            <input
                                type={showCpassword ? 'text' : 'password'}
                                placeholder="at least 8 characters"
                                className="w-full p-2 border border-gray-300 rounded mt-2 pr-10"
                                value={state.cpassword}
                                name='password'
                                onChange={(e) => updateState({ cpassword: e.target.value })}
                            />
                            <div
                                className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-500 text-lg cursor-pointer"
                                onClick={() => setShowCpassword(!showCpassword)}
                            >
                                {showCpassword ? <FaEye /> : <FaEyeSlash />}
                            </div>
                        </div>

                        <div className="text-right mb-4">
                            <Link to="/login" className="text-[--active-purple-color] hover:underline">
                                Login?
                            </Link>
                        </div>
                        <button onClick={(e) => submit(e)} className="w-full bg-[--active-purple-color] text-white p-3 rounded-full">
                            {isLoading && <CircularProgress color='white' size={12} />}
                            Submit
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden md:flex md:w-1/2 bg-purple-50 justify-center items-center">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-[--active-purple-color]">Welcome back</h2>
                    <p className="text-gray-600 mt-4">Nice to see you again</p>
                    <img
                        src={img}
                        alt="Welcome illustration"
                        className="mt-6 w-[60%] mx-auto"
                    />
                </div>
            </div>
        </div>
    )
}

export default ChangePasswordUI
