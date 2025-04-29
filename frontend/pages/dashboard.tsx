import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Link from "next/link";
import { Query } from "../types";
import { toast } from "react-hot-toast";
import QueryCard from "../components/QueryCard";

export default function Dashboard() {
    const { user } = useAuth();
    const [queries, setQueries] = useState<Query[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQueries = async () => {
            try {
                let endpoint = "";
                if (user?.role === "customer") {
                    endpoint = "/api/queries/my-queries";
                } else if (user?.role === "consultant") {
                    endpoint = "/api/queries/assigned";
                } else if (user?.role === "admin") {
                    endpoint = "/api/queries";
                }

                const response = await axios.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                // Ensure response.data is an array
                const data = Array.isArray(response.data) ? response.data : [];
                setQueries(data);
                setError(null);
            } catch (error) {
                console.error("Error fetching queries:", error);
                setError("Failed to fetch queries");
                toast.error("Failed to fetch queries");
                setQueries([]);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchQueries();
        }
    }, [user]);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-red-500">{error}</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {user?.role === "customer" && "My Queries"}
                        {user?.role === "consultant" && "Assigned Queries"}
                        {user?.role === "admin" && "All Queries"}
                    </h1>
                    <div className="space-x-4">
                        {user?.role === "customer" && (
                            <Link
                                href="/queries/new"
                                className="btn btn-primary"
                            >
                                New Query
                            </Link>
                        )}
                        {user?.role === "admin" && (
                            <Link
                                href="/create-consultant"
                                className="btn btn-secondary"
                            >
                                Create Consultant
                            </Link>
                        )}
                    </div>
                </div>

                {queries.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No queries found</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {queries.map((query) => (
                            <QueryCard key={query._id} query={query} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
