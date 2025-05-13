import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import Link from "next/link";
import QueryCard from "../components/QueryCard";
import { Query } from "../types";

export default function AssignedQueries() {
    const [queries, setQueries] = useState<Query[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
    const [response, setResponse] = useState("");

    useEffect(() => {
        const fetchQueries = async () => {
            try {
                const response = await axios.get("/api/queries/assigned", {
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

    const handleSubmitResponse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuery) return;

        try {
            await axios.post(
                `/api/queries/${selectedQuery.id}/respond`,
                { response },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            setQueries(
                queries.map((q) =>
                    q.id === selectedQuery.id
                        ? { ...q, response, status: "resolved" }
                        : q,
                ),
            );
            setSelectedQuery(null);
            setResponse("");
        } catch (err) {
            setError("Failed to submit response");
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Assigned Queries
                </h1>
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
