import React, { useState } from 'react'
import { useRegister } from '../../hooks/auth/auth'
import { useSnackbar } from '../../context/SnackBarContext'
import RegisterUI from "../../component/ui/auth/RegisterUI"
import { validateEmail } from '../../validations/validate'

const Register = () => {
    const { handleSubmit, isLoading } = useRegister()
    const { showError } = useSnackbar();
    const [user, setUser] = useState({
        email: '',
        password: '',
        cpassword: '',
        checked: false,
        name: "",
    })

    const validatePassword = (password) => {
        const requirements = [
            { test: (p) => p.length >= 6, message: "Password must contain at least 6 characters" },
            { test: (p) => /[0-9]/.test(p), message: "Password must contain at least one number" },
            { test: (p) => /[a-z]/.test(p), message: "Password must contain one lower case character" },
            { test: (p) => /[A-Z]/.test(p), message: "Password must contain one upper case character" },
            { test: (p) => /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(p), message: "Password must contain one special character" }
        ];

        for (const { test, message } of requirements) {
            if (!test(password)) {
                return showError(message);
            }
        }
        return true;
    };

    const updateState = (data) => {
        setUser((prevState) => {
            const newState = { ...prevState, ...data }
            return newState
        })
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        if (!validateEmail(user.email)) {
            return showError("Enter valid email")
        } else if (!validatePassword(user.password)) {
            return;
        }
        else if (user.password != user.cpassword) {
            return showError("Pasword not Match")
        } else {
            handleSubmit({
                email: user.email,
                password: user.password,
                name: user.name,
            })
        }
    }

    return (
        <RegisterUI
            updateState={updateState}
            handleRegister={handleRegister}
            user={user}
            isLoading={isLoading}
        />
    )
}

export default Register
