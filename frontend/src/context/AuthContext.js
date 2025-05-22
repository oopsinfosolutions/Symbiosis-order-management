import { useContext, createContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [empId, setEmpId] = useState(null);

  return (
    <AuthContext.Provider value={{ empId, setEmpId }}>
      {children}
    </AuthContext.Provider>
  );
};
