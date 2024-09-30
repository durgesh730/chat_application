import React from 'react'
import { Link } from "react-router-dom"
import { CircularProgress } from '@mui/material';
import img from "../../../assets/images/Forgotpassword.png"

const ForgotPasswordUI = ({
    forgotPassword,
    email,
    setEmail,
    isLoading
}) => {
    return (
        <div className="flex min-h-screen">
            <div className="w-full md:w-1/2 p-10 pt-32 bg-white">
                <div className="max-w-md mx-auto">
                    <h1 className="text-4xl font-bold mb-6 text-black">Forgot Password.</h1>
                    <p className="mb-6 text-gray-500">
                        Forgot Password with your data that you entered during your registration
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
                                value={email}
                                name='email'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="text-right mb-4">
                            <Link to="/login" className="text-[--active-purple-color] hover:underline">
                                Login?
                            </Link>
                        </div>
                        <button onClick={(e) => forgotPassword(e)} className="w-full bg-[--active-purple-color] text-white p-3 rounded-full">
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

export default ForgotPasswordUI
