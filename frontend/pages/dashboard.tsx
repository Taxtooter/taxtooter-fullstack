import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Link from "next/link";
import { Query } from "../types";
import { toast } from "react-hot-toast";
import QueryCard from "../components/QueryCard";
import React from "react";

export default function Dashboard() {
    const { user } = useAuth();
    const [queries, setQueries] = useState<Query[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string | null>(null);

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

    // --- Query State Calculations ---
    const isUnanswered = (q: Query) => {
        if (!q.responses || q.responses.length === 0) return true;
        // If none of the responses are from consultant or admin
        return !q.responses.some(r => r.user?.role === "consultant" || r.user?.role === "admin");
    };

    const getCustomerStats = () => {
        const unanswered = queries.filter(isUnanswered);
        const resolved = queries.filter(q => q.status === "resolved");
        const raised = queries;
        const openOngoing = queries.filter(q => q.status === "open" || q.status === "assigned");
        return {
            unanswered,
            resolved,
            raised,
            openOngoing,
        };
    };

    const getConsultantStats = () => {
        const assigned = queries;
        const resolved = queries.filter(q => q.status === "resolved");
        const unanswered = queries.filter(isUnanswered);
        const awaiting = queries.filter(q => {
            if (!q.responses || q.responses.length === 0) return true;
            const last = q.responses[q.responses.length - 1];
            // If last response is from customer, or no responses
            return last.user?.role === "customer";
        });
        return {
            assigned,
            resolved,
            unanswered,
            awaiting,
        };
    };

    const getAdminStats = () => {
        const total = queries;
        const unassigned = queries.filter(q => !q.consultant || !q.consultant.id);
        const unanswered = queries.filter(isUnanswered);
        const resolved = queries.filter(q => q.status === "resolved");
        const openOngoing = queries.filter(q => q.status === "open" || q.status === "assigned");
        return {
            total,
            unassigned,
            unanswered,
            resolved,
            openOngoing,
        };
    };

    // --- Filtering Logic ---
    let filteredQueries: Query[] = queries;
    let statsBoxes: { label: string; count: number; key: string; color: string }[] = [];

    if (user?.role === "customer") {
        const stats = getCustomerStats();
        statsBoxes = [
            { label: "Unanswered", count: stats.unanswered.length, key: "unanswered", color: "bg-red-100 text-red-800" },
            { label: "Resolved", count: stats.resolved.length, key: "resolved", color: "bg-green-100 text-green-800" },
            { label: "Raised", count: stats.raised.length, key: "raised", color: "bg-blue-100 text-blue-800" },
            { label: "Open/Ongoing", count: stats.openOngoing.length, key: "openOngoing", color: "bg-yellow-100 text-yellow-800" },
        ];
        if (filter === "unanswered") filteredQueries = stats.unanswered;
        else if (filter === "resolved") filteredQueries = stats.resolved;
        else if (filter === "raised") filteredQueries = stats.raised;
        else if (filter === "openOngoing") filteredQueries = stats.openOngoing;
    } else if (user?.role === "consultant") {
        const stats = getConsultantStats();
        statsBoxes = [
            { label: "Unanswered", count: stats.unanswered.length, key: "unanswered", color: "bg-red-100 text-red-800" },
            { label: "Resolved", count: stats.resolved.length, key: "resolved", color: "bg-green-100 text-green-800" },
            { label: "Assigned", count: stats.assigned.length, key: "assigned", color: "bg-blue-100 text-blue-800" },
            { label: "Awaiting Consultant's Answer", count: stats.awaiting.length, key: "awaiting", color: "bg-yellow-100 text-yellow-800" },
        ];
        if (filter === "unanswered") filteredQueries = stats.unanswered;
        else if (filter === "resolved") filteredQueries = stats.resolved;
        else if (filter === "assigned") filteredQueries = stats.assigned;
        else if (filter === "awaiting") filteredQueries = stats.awaiting;
    } else if (user?.role === "admin") {
        const stats = getAdminStats();
        statsBoxes = [
            { label: "Total", count: stats.total.length, key: "total", color: "bg-blue-100 text-blue-800" },
            { label: "Unassigned", count: stats.unassigned.length, key: "unassigned", color: "bg-yellow-100 text-yellow-800" },
            { label: "Unanswered", count: stats.unanswered.length, key: "unanswered", color: "bg-red-100 text-red-800" },
            { label: "Resolved", count: stats.resolved.length, key: "resolved", color: "bg-green-100 text-green-800" },
            { label: "Open/Ongoing", count: stats.openOngoing.length, key: "openOngoing", color: "bg-purple-100 text-purple-800" },
        ];
        if (filter === "total") filteredQueries = stats.total;
        else if (filter === "unassigned") filteredQueries = stats.unassigned;
        else if (filter === "unanswered") filteredQueries = stats.unanswered;
        else if (filter === "resolved") filteredQueries = stats.resolved;
        else if (filter === "openOngoing") filteredQueries = stats.openOngoing;
    }

    // Show only top 5 if no filter
    if (!filter) filteredQueries = filteredQueries.slice(0, 5);

    // --- UI ---
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

                {/* Stats Boxes */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                    {statsBoxes.map(box => (
                        <button
                            key={box.key}
                            className={`rounded-lg shadow p-4 flex flex-col items-center justify-center font-semibold text-lg transition border-2 border-transparent hover:border-primary focus:outline-none ${box.color} ${filter === box.key ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setFilter(box.key)}
                        >
                            <span>{box.label}</span>
                            <span className="text-2xl font-bold mt-1">{box.count}</span>
                        </button>
                    ))}
                </div>
                {filter && (
                    <div className="mb-4 flex justify-end">
                        <button
                            className="btn btn-outline"
                            onClick={() => setFilter(null)}
                        >
                            Reset
                        </button>
                    </div>
                )}

                {filteredQueries.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No queries found</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredQueries.map((query) => (
                            <QueryCard key={query.id} query={query} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
