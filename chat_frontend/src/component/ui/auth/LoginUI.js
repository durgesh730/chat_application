import React, { useState } from 'react'
import { Link } from "react-router-dom"
import { CircularProgress } from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import img from "../../../assets/images/gift-amico.png"

const LoginUI = ({
    login,
    user,
    updateState,
    isLoading
}) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="flex min-h-screen">
            <div className="w-full md:w-1/2 p-10 pt-28 bg-white">
                <div className="max-w-md mx-auto">
                    <h1 className="text-4xl font-bold mb-6 text-black">Log in.</h1>
                    <p className="mb-6 text-gray-500">
                        Log in with your data that you entered during your registration
                    </p>
                    <form>
                        <div className="mb-4">
                            <label className="block text-gray-700">
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full p-2 border border-gray-300 rounded mt-2"
                                value={user.email}
                                name='email'
                                onChange={(e) => updateState({ email: e.target.value })}
                            />
                        </div>
                        <div className="mb-4 relative">
                            <label className="block text-gray-700">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="at least 8 characters"
                                className="w-full p-2 border border-gray-300 rounded mt-2 pr-10"
                                value={user.password}
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
                        <div className="text-right mb-4">
                            <Link to="/forgot/password" className="text-[--active-purple-color] hover:underline">
                                Forget password?
                            </Link>
                        </div>
                        <button onClick={(e) => login(e)} className="w-full bg-[--active-purple-color] text-white p-3 rounded-full">
                            {isLoading && <CircularProgress color='white' size={12} />}
                            Log in
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p>
                            Don’t have an account?{' '}
                            <Link to="/register" className="text-purple-600 hover:underline">
                                Register
                            </Link>
                        </p>
                    </div>
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
                        className="mt-10 w-[60%] mx-auto"
                    />
                </div>
            </div>
        </div>
    )
}

export default LoginUI
