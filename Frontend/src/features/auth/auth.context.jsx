import { createContext,useState } from "react";


export const AuthContext = createContext()


export const AuthProvider = ({ children }) => { 

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    // Tracks whether the initial getMe session check is still in flight
    const [initializing, setInitializing] = useState(true)

    


    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading,initializing,setInitializing}} >
            {children}
        </AuthContext.Provider>
    )

    
}