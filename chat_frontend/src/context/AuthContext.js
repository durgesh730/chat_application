import React, { createContext, useContext, useEffect, useState } from 'react';
import fetcher from '../helper/fetcher';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null)
  const [receiver, setReceiver] = useState(null)

  useEffect(() => {
    fetcher.get("/auth/valid_user")
      .then((res) => {
        // console.log("res in side context  ========>>>>>>", res)
        if (res?.data?.success) {
          const user = res.data.data
          setUser(user)
          setIsAuthenticated(true)
        }
      })
      .catch((err) => {
        setIsAuthenticated(false)
        console.log(err)
      })
  }, [])

  const logout = () => {
    localStorage.clear()
    window.location.href = '/login'
  };

  console.log("user ===========>>>>>>>>>>", user)
  console.log("isAuthenticated ========>>>>", isAuthenticated)

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      setIsAuthenticated,
      logout,
      user,
      setUser,
      setReceiver,
      receiver
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
