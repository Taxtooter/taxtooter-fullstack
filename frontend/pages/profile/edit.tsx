import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

export default function EditProfile() {
    const router = useRouter();
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                password: "",
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put("/api/users/profile", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setMessage("Profile updated successfully");
            // Only update user context if user exists
            if (user) {
                updateUser({
                    ...user,
                    name: formData.name,
                    email: formData.email,
                });
            }
            setFormData({ ...formData, password: "" }); // Clear password field
        } catch (error) {
            setMessage("Error updating profile");
        }
    };

    if (!user) {
        return <Layout>Loading...</Layout>;
    }

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:text-gray-100">
                <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">
                    Edit Profile
                </h1>

                {message && (
                    <div
                        className={`mb-4 p-3 rounded ${message.includes("success") ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"}`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2"
                            htmlFor="name"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label
                            className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2"
                            htmlFor="password"
                        >
                            New Password (leave blank to keep current)
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
