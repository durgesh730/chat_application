import React from 'react';

const ProfileUI = ({ profile }) => {
    return (
        <main className="w-full my-2">
            <div className="w-full px-6 pb-6 mt-8 sm:w-full sm:rounded-lg">
                <img
                    className="object-cover w-32 mx-auto h-32 p-1 rounded-full ring-2 ring-indigo-300 dark:ring-indigo-500"
                    src={profile.profile_image}
                    alt="Bordered avatar"
                />
                <div className="text-center w-full mt-4 text-[#202142]">
                    <div>
                        <span>{profile.name}</span> <br/>
                        <span>{profile.email}</span>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ProfileUI;
