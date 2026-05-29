import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading, initializing, setInitializing } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            localStorage.setItem('token', data.token)
            setUser(data.user)
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            localStorage.setItem('token', data.token)
            setUser(data.user)
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            localStorage.removeItem('token')
            setUser(null)
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setLoading(false)
        }
    }

    // Check for an existing session in the background.
    // This no longer blocks the UI — it only sets `initializing` to false when done.
    useEffect(() => {

        const getAndSetUser = async () => {
            try {

                const data = await getMe()
                setUser(data.user)
            } catch (err) { } finally {
                setInitializing(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, initializing, handleRegister, handleLogin, handleLogout }
}