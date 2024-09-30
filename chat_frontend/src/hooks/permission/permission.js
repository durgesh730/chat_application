import { useEffect, useState } from "react"
import fetcher from "../../helper/fetcher";
import { useSnackbar } from "../../context/SnackBarContext";

export const useGetAllRole = () => {
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
        fetcher.get('/role/get_all_role', { params })
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
export const useGetAllPermission = () => {
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
        fetcher.get('/permission/get_all_permission', { params })
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

export const useDeleteRole = (refetch) => {
    const { showError, showSuccess } = useSnackbar()
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRoleDelete = (id) => {
        setIsLoading(true)
        fetcher.delete(`/role/delete_role/${id}`)
            .then((res) => {
                showSuccess(res.data?.message)
                refetch()
            })
            .catch((err) => {
                showError(err?.data?.message || "Some Error Occured")
                console.log(err)
            })
            .finally(() => {
                setIsLoading(false)
                setIsModalOpen(false)
            })
    }

    return {
        handleRoleDelete,
        isLoading,
        setIsModalOpen,
        isModalOpen
    }
}

export const useEditRole = (refetch) => {
    const { showError, showSuccess } = useSnackbar()
    const [isLoading, setIsLoading] = useState(false)

    const handleEditRole = (id, body) => {
        setIsLoading(true)
        fetcher.patch(`/role/create_role/${id}`, body)
            .then((res) => {
                showSuccess(res.data?.message)
                refetch()
            })
            .catch((err) => {
                showError(err?.data?.message)
                console.log(err)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    return { handleEditRole, isLoading }
}

