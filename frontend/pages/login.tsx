import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import Layout from "../components/Layout";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { login, user } = useAuth();

    // Redirect if already logged in
    if (user) {
        if (typeof window !== "undefined") router.replace("/dashboard");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            router.push("/dashboard");
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                            Sign in to your account
                        </h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="input rounded-t-md"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="rounded-b-md"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="font-medium text-primary hover:text-primary/80"
                            >
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
