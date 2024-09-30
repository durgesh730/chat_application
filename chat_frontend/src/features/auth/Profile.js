import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDispatch, useSelector } from 'react-redux'
import { validateEmail } from '../../validations/validate'
import { useSnackbar } from '../../context/SnackBarContext'
import ProfileUI from '../../component/ui/profileUI.js/ProfileUI'
import { updateProfile } from '../../redux/slice/auth/updateProfile'

const Profile = () => {
    const dispatch = useDispatch()
    const { user } = useAuth()
    
    const { showSuccess, showError } = useSnackbar();
    const state = useSelector(state => state.profile)
    const [profile, setProfile] = useState({
        email: user.email || '',
        telephone: user.telephone || '',
        address: user.address || '',
        country: user.country || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profile_image: user.profile_image || '',
    })

    const updateState = (data) => {
        setProfile((prevState) => {
            const newState = { ...prevState, ...data }
            return newState
        })
    }

    const submit = async (e) => {
        e.preventDefault()
        if (!validateEmail(profile.email)) {
            return showError("Enter valid email")
        } else {
            const resultAction = await dispatch(updateProfile(profile));
            if (updateProfile.fulfilled.match(resultAction)) {
                showSuccess('Profile Updated successfully!');
            } else {
                showError(resultAction.payload?.message || "Some Error Occured");
            }
        }
    }

    return (
        <ProfileUI
            profile={profile}
            submit={submit}
            isLoading={state.isLoading}
            updateState={updateState}
        />
    )
}

export default Profile


