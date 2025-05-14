import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import QueryCard from "../../components/QueryCard";
import { Query } from "../../types";

export default function Queries() {
    const [queries, setQueries] = useState<Query[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        const fetchQueries = async () => {
            try {
                const response = await axios.get("/api/queries/my-queries", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setQueries(response.data);
            } catch (err) {
                setError("Failed to fetch queries");
            } finally {
                setLoading(false);
            }
        };
        fetchQueries();
    }, []);

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        My Queries
                    </h1>
                    <Link href="/queries/new" className="btn btn-primary">
                        New Query
                    </Link>
                </div>
                {loading && <div>Loading...</div>}
                {error && (
                    <div className="text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}
                <div className="grid gap-6">
                    {queries.map((query) => (
                        <QueryCard key={query.id} query={query} />
                    ))}
                </div>
            </div>
        </Layout>
    );
}
