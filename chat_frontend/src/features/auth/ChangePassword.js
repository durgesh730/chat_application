import React, { useEffect, useState } from 'react'
import ChangePasswordUI from '../../component/ui/auth/ChangePasswordUI'
import { useChangePasword } from '../../hooks/auth/auth'
import { useSnackbar } from '../../context/SnackBarContext'

const ChangePassword = () => {
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const param = queryParams.get('token');

    const { changePassword, isLoading } = useChangePasword()
    const { showError } = useSnackbar();
    const [paramValue, setParamValue] = useState('');
    const [state, setState] = useState({
        password: '',
        cpassword: ''
    })

    useEffect(() => {
        if (!param) {
            return showError("Token not found in URL. Please provide the token to reset your Password")
        }
        setParamValue(param);
    }, [state]);

    // console.log("paramValue =======>>>>", paramValue)

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
        setState((prevState) => {
            const newState = { ...prevState, ...data }
            return newState
        })
    }

    const submit = (e) => {
        e.preventDefault()
        if (!validatePassword(state.password)) {
            return;
        } else if (state.password != state.cpassword) {
            return showError("Pasword not Match")
        } else {
            changePassword({
                newPassword: state.password,
            },
                paramValue
            )
        }
    }

    return (
        <ChangePasswordUI
            submit={submit}
            state={state}
            updateState={updateState}
            isLoading={isLoading}
        />
    )
}

export default ChangePassword
