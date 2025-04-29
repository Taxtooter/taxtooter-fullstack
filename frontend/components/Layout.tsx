// To add new pages, create a file in frontend/pages/ (e.g., pages/your-feature.tsx).
// To add new components, use frontend/components/.
// Follow the contribution process in the README: fork, branch, commit, push, and open a pull request.
// Use clear commit messages and keep code modular and well-commented.

import { ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LayoutProps } from "../types";
import Toast from "./Toast";

export default function Layout({ children }: LayoutProps) {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Toast />
            <nav className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-primary">
                                    TaxTooter
                                </span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    href="/dashboard"
                                    className={`${
                                        router.pathname === "/dashboard"
                                            ? "border-primary text-gray-900 dark:text-gray-100"
                                            : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Dashboard
                                </Link>
                                {user?.role === "customer" && (
                                    <Link
                                        href="/queries"
                                        className={`${
                                            router.pathname === "/queries"
                                                ? "border-primary text-gray-900 dark:text-gray-100"
                                                : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                    >
                                        My Queries
                                    </Link>
                                )}
                                {user?.role === "consultant" && (
                                    <Link
                                        href="/assigned-queries"
                                        className={`${
                                            router.pathname ===
                                            "/assigned-queries"
                                                ? "border-primary text-gray-900 dark:text-gray-100"
                                                : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                    >
                                        Assigned Queries
                                    </Link>
                                )}
                                {user?.role === "admin" && (
                                    <>
                                        <Link
                                            href="/all-queries"
                                            className={`${
                                                router.pathname ===
                                                "/all-queries"
                                                    ? "border-primary text-gray-900 dark:text-gray-100"
                                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
                                            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                        >
                                            All Queries
                                        </Link>
                                        <Link
                                            href="/admin/users"
                                            className={`${
                                                router.pathname ===
                                                "/admin/users"
                                                    ? "border-primary text-gray-900 dark:text-gray-100"
                                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
                                            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                        >
                                            User Management
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <div className="ml-3 relative">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                        aria-label="Toggle theme"
                                    >
                                        {theme === "light" ? (
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                    <Link
                                        href="/profile/edit"
                                        className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary cursor-pointer"
                                    >
                                        {user?.name}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-secondary"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
