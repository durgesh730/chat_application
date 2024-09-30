import { useEffect, useState } from "react"
import fetcher from "../../helper/fetcher"
import { useSnackbar } from "../../context/SnackBarContext"
import { useNavigate } from "react-router-dom"

export const useForgotPasword = () => {
    const { showError, showSuccess } = useSnackbar()
    const [isLoading, setIsLoading] = useState(false)

    const forgotPassword = (email) => {
        setIsLoading(true)
        fetcher.post("/auth/forgot_password", email)
            .then((res) => {
                // console.log("res forgotPassword  ======>>>>>", res)
                showSuccess("Change Password Link Send to Your Email Successfully")
            })
            .catch((err) => {
                // console.log("err forgotPassword  ======>>>>>", err)
                showError(err.response.data.message || "Some Error Occured")
            }).finally(() => {
                setIsLoading(false)
            })
    }

    return { forgotPassword, isLoading }
}

export const useChangePasword = () => {
    const { showError, showSuccess } = useSnackbar()
    const [isLoading, setIsLoading] = useState(false)

    const changePassword = (newPassword, token) => {
        setIsLoading(true)
        fetcher.post(`/auth/reset_password?token=${token}`, newPassword, token)
            .then((res) => {
                // console.log("res changePassword  ======>>>>>", res)
                showSuccess("Change Password Link Send to Your Email Successfully")
            })
            .catch((err) => {
                // console.log("err changePassword  ======>>>>>", err)
                showError(err.response?.data?.message || "Some Error Occured")
            }).finally(() => {
                setIsLoading(false)
            })
    }

    return { changePassword, isLoading }
}


export const useRegister = () => {
    const navigate = useNavigate()
    const { showError, showSuccess } = useSnackbar()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (body) => {
        setIsLoading(true)
        fetcher.post(`/auth/register`, body)
            .then((res) => {
                // console.log("res useRegister  ======>>>>>", res)
                navigate("/login")
                showSuccess("Account created successfully")
            })
            .catch((err) => {
                // console.log("err useRegister  ======>>>>>", err)
                showError(err.response?.data?.message || "Some Error Occured")
            }).finally(() => {
                setIsLoading(false)
            })
    }

    return { isLoading, handleSubmit }
}



export const useGetAllUser = () => {
    const [state, setState] = useState(null);
    const [isLoading, setIsLoading] = useState(true)
    const [refetchCounter, setRefetchCounter] = useState(0);
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
    })

    const setPage = (page) => {
        setParams({ ...params, page: page })
    }

    const refetch = () => {
        setRefetchCounter((prev) => prev + 1)
    }

    useEffect(() => {
        fetcher.get('/auth/get_all_users', { params })
            .then((res) => {
                setState({
                    ...res.data
                })
            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [params, refetchCounter])

    return {
        setPage,
        isLoading,
        params,
        setParams,
        state,
        refetch,
    }
}