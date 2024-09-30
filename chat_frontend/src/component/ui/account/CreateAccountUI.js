import React, { useState } from 'react'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { CircularProgress } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const CreateAccountUI = ({ profile, updateState, submit, isLoading, state }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <main className="w-full my-2 shadow-md bg-white rounded-md">
            <div className="p-2 md:p-4">
                <div className="w-full px-6 pb-6 mt-8 sm:w-full sm:rounded-lg">
                    <h2 className="text-2xl font-bold text-center text-gray-600 sm:text-xl">Create Account</h2>

                    <div className="grid w-full mx-auto">
                        <div className="items-center w-full mt-4 sm:mt-8 text-[#202142]">
                            <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
                                <div className="w-full">
                                    <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-600">First name</label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        placeholder="First name"
                                        className="w-full p-2 border border-gray-300 rounded mt-2"
                                        name='first_name'
                                        value={profile.firstName}
                                        onChange={(e) => updateState({ firstName: e.target.value })}
                                    />
                                </div>

                                <div className="w-full">
                                    <label htmlFor="last_name" className="block mb-2 text-sm font-medium text-gray-600">Last name</label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        placeholder="Last name"
                                        className="w-full p-2 border border-gray-300 rounded mt-2"
                                        name='lastName'
                                        value={profile.lastName}
                                        onChange={(e) => updateState({ lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
                                <div className="w-full">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-600">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Email"
                                        className="w-full p-2 border border-gray-300 rounded mt-2"
                                        name='email'
                                        value={profile.email}
                                        onChange={(e) => updateState({ email: e.target.value })}
                                    />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-600">Phone Number</label>
                                    <input
                                        type="number"
                                        id="phone"
                                        placeholder="Phone Number"
                                        className="w-full p-2 border border-gray-300 rounded mt-2"
                                        name='telephone'
                                        value={profile.telephone}
                                        onChange={(e) => updateState({ telephone: e.target.value })}
                                    />
                                </div>

                            </div>

                            <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
                                <div className="w-full relative">
                                    <label className="block text-gray-700">Password</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="at least 8 characters"
                                        className="w-full p-2 border border-gray-300 rounded mt-2 pr-10"
                                        value={profile.password}
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


                                <FormControl className='w-full' size="small">
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-600">Select Role</label>
                                    <Select
                                        labelId="country-select-label"
                                        id="country-select"
                                        value={profile.role}
                                        onChange={(e) => updateState({ roleId: e.target.value })}
                                        className="w-full mt-2"
                                        inputProps={{ 'aria-label': 'Without label' }}
                                    >
                                        {state.map((item, index) => {
                                            return (
                                                <MenuItem key={index} value={item._id}>{item.role}</MenuItem>
                                            )
                                        })}
                                    </Select>
                                </FormControl>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={(e) => submit(e)}
                                    className="w-full bg-[--active-purple-color] text-white p-3 rounded-md">
                                    {isLoading && <CircularProgress color='inherit' size={12} />}
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default CreateAccountUI
