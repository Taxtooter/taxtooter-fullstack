import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { User, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (token: string) => {
        try {
            const response = await axios.get("/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const u = response.data;
            setUser({ ...u, id: u.id });
        } catch (error) {
            console.error("Error fetching user:", error);
            localStorage.removeItem("token");
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await axios.post("/api/auth/login", {
            email,
            password,
        });
        const { token, user: u } = response.data;
        localStorage.setItem("token", token);
        setToken(token);
        setUser({ ...u, id: u.id });
    };

    const register = async (
        email: string,
        password: string,
        name: string,
        role: string,
    ) => {
        const response = await axios.post("/api/auth/register", {
            email,
            password,
            name,
            role,
        });
        const { token, user: u } = response.data;
        localStorage.setItem("token", token);
        setToken(token);
        setUser({ ...u, id: u.id });
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                loading,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
