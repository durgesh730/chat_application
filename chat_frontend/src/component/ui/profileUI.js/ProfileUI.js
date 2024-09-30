import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { CircularProgress } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import UploadImage from '../../custom/UploadImage';

const ProfileUI = ({ submit, isLoading, profile, updateState }) => {

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateState({ profile_image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <main className="w-full my-2 shadow-md bg-white rounded-md">
            <div className="p-2 md:p-4">
                <div className="w-full px-6 pb-6 mt-8 sm:w-full sm:rounded-lg">
                    <h2 className="pl-6 text-2xl font-bold sm:text-2xl text-gray-600 text-center">Profile</h2>

                    <div className="grid w-full mx-auto mt-6">
                        <div className="md:flex flex-row justify-start gap-8 mx-auto items-center w-full">
                            <img
                                className="object-cover w-36 h-36 p-1 md:mx-0 mx-auto rounded-full ring-2 ring-indigo-300 dark:ring-indigo-500"
                                src={profile.profile_image}
                                alt="Bordered avatar"
                            />

                            <div className="pt-4 lg:w-[40%] md:w-[50%]  w-full">
                                <UploadImage onFileChange={handleFileChange} />
                            </div>
                        </div>

                        <div className="items-center w-full mt-8 sm:mt-12 text-[#202142]">
                            <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
                                <div className="w-full">
                                    <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-600">Your first name</label>
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
                                    <label htmlFor="last_name" className="block mb-2 text-sm font-medium text-gray-600">Your last name</label>
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
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-600">Your email</label>
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
                                        type="text"
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
                                <div className="w-full">
                                    <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-600">Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        placeholder="Address"
                                        className="w-full p-2 border border-gray-300 rounded"
                                        name='address'
                                        value={profile.address}
                                        onChange={(e) => updateState({ address: e.target.value })}
                                    />
                                </div>

                                <FormControl className='w-full' size="small">
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-600">Country</label>
                                    <Select
                                        labelId="country-select-label"
                                        id="country-select"
                                        value={profile.country}
                                        onChange={(e) => updateState({ country: e.target.value })}
                                        className="w-full mt-2"
                                        inputProps={{ 'aria-label': 'Without label' }}
                                    >
                                        <MenuItem value={"India"}>India</MenuItem>
                                        <MenuItem value={"Indonesia"}>Indonesia</MenuItem>
                                        <MenuItem value={"Argentina"}>Argentina</MenuItem>
                                        <MenuItem value={"Iran"}>Iran</MenuItem>
                                        <MenuItem value={"Sweden"}>Sweden</MenuItem>
                                        <MenuItem value={"Switzerland"}>Switzerland</MenuItem>
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
    );
}

export default ProfileUI;
