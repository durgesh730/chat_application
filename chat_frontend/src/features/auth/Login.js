import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginUI from '../../component/ui/auth/LoginUI'
import { useDispatch, useSelector } from "react-redux"
import { userLogin } from '../../redux/slice/auth/login';
import { useSnackbar } from '../../context/SnackBarContext';
import { validateEmail } from '../../validations/validate';

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { setIsAuthenticated, setUser: Log } = useAuth()
    const { showSuccess, showError } = useSnackbar();
    const state = useSelector(state => state.login)
    const [user, setUser] = useState({
        email: '',
        password: ''
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

    const login = async (e) => {
        e.preventDefault()

        if (!validateEmail(user.email)) {
            return showError("Enter valid email")
        } else if (!validatePassword(user.password)) {
            return;
        } else {
            const resultAction = await dispatch(userLogin(user));
            if (userLogin.fulfilled.match(resultAction)) {
                const userData = resultAction.payload.data;
                Log(userData)
                showSuccess('Login successfully!');
                setIsAuthenticated(true)
                navigate('/')
            } else {
                showError(resultAction.payload?.message || "Some Error Occured");
            }
        }
    }

    return (
        <LoginUI
            login={login}
            updateState={updateState}
            user={user}
            isLoading={state.isLoading}
        />
    )
}

export default Login
