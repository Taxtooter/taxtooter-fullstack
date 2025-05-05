import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { logger } from "../../lib/logger";
import { Query, Consultant, User } from "../../types";
import { toast } from "react-hot-toast";
import QueryStatusBadge from "../../components/QueryStatusBadge";
import Modal from "../../components/Modal";

export default function QueryDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [query, setQuery] = useState<Query | null>(null);
    const [consultant, setConsultant] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState("");
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [assignLoading, setAssignLoading] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [pendingConsultantId, setPendingConsultantId] = useState<
        string | null
    >(null);

    // Add file state for response form
    const [responseFile, setResponseFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    const [signedImageUrls, setSignedImageUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchQuery = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/queries/${id}`);
                setQuery(response.data);
                console.log("Fetched query:", response.data);
            } catch (err) {
                logger.error("Error fetching query", err);
                setError("Failed to load query details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchQuery();
        }
    }, [id]);

    useEffect(() => {
        // Fetch consultants if admin
        const fetchConsultants = async () => {
            if (user?.role === "admin") {
                try {
                    const res = await api.get("/api/users/consultants", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    setConsultants(res.data);
                } catch (err) {
                    // ignore for now
                }
            }
        };
        fetchConsultants();
    }, [user]);

    useEffect(() => {
        // Fetch signed URLs for all image files in responses
        if (query && query.responses) {
            query.responses.forEach(async (resp) => {
                if (
                    resp.file &&
                    resp.file.key &&
                    resp.file.filename?.match(/\.(jpg|jpeg|png|gif)$/i) &&
                    !signedImageUrls[resp.file.key]
                ) {
                    const res = await fetch(`/api/upload/signed-url?key=${encodeURIComponent(resp.file.key)}`);
                    const data = await res.json();
                    setSignedImageUrls((prev) => ({ ...prev, [resp.file.key]: data.url }));
                }
            });
        }
    }, [query]);

    const handleResponseFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files && e.target.files[0]) {
            setResponseFile(e.target.files[0]);
            setFilePreviewUrl(URL.createObjectURL(e.target.files[0]));
        } else {
            setResponseFile(null);
            setFilePreviewUrl(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query || !response.trim()) return;

        try {
            const formData = new FormData();
            formData.append("response", response.trim());
            if (responseFile) formData.append("file", responseFile);
            await api.post(`/api/queries/${query._id}/respond`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            // Refresh the query to show the new response
            const updatedResponse = await api.get(`/api/queries/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setQuery(updatedResponse.data);
            setResponse("");
            setResponseFile(null);
            setFilePreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error: any) {
            setError(
                error.response?.data?.message || "Error submitting response",
            );
        }
    };

    const handleAssignConsultant = async (consultantId: string) => {
        if (!query) return;
        setAssignLoading(true);
        try {
            await api.post(
                `/api/queries/${query._id}/assign`,
                { consultantId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            toast.success("Consultant assigned successfully");
            // Refresh query
            const updatedResponse = await api.get(`/api/queries/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setQuery(updatedResponse.data);
        } catch (err) {
            toast.error("Failed to assign consultant");
        } finally {
            setAssignLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!query) return;
        setShowResolveModal(false);
        try {
            await api.post(
                `/api/queries/${query._id}/resolve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            toast.success("Query resolved successfully");
            // Refresh the query to show the new status
            const updatedResponse = await api.get(`/api/queries/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setQuery(updatedResponse.data);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to resolve query",
            );
        }
    };

    // Helper to get signed URL for S3 file
    const getSignedUrl = async (key: string) => {
        const res = await fetch(`/api/upload/signed-url?key=${encodeURIComponent(key)}`);
        const data = await res.json();
        return data.url;
    };

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !query) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error || "Query not found"}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                        {query.title}
                    </h1>
                    <div className="mb-4">
                        <p className="text-gray-600 dark:text-gray-300">
                            {query.description}
                        </p>
                    </div>
                    <div className="mb-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Status:{" "}
                        </span>
                        <QueryStatusBadge query={query} />
                    </div>
                    <div className="mb-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Customer:{" "}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {query.customer?.name} ({query.customer?.email})
                        </span>
                    </div>
                    {query.consultant && (
                        <div className="mb-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Consultant:{" "}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {query.consultant.name} (
                                {query.consultant.email})
                            </span>
                        </div>
                    )}
                    {user?.role === "admin" &&
                        query.status === "open" &&
                        !query.consultant && (
                            <div className="mb-4">
                                <label
                                    htmlFor="assignConsultant"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Assign to Consultant
                                </label>
                                <select
                                    id="assignConsultant"
                                    className="input mt-1"
                                    defaultValue=""
                                    onChange={(e) => {
                                        if (!e.target.value) return;
                                        setPendingConsultantId(e.target.value);
                                        setShowAssignModal(true);
                                    }}
                                    disabled={assignLoading}
                                >
                                    <option value="">
                                        Select a consultant
                                    </option>
                                    {consultants.map((consultant) => (
                                        <option
                                            key={consultant._id}
                                            value={consultant._id}
                                        >
                                            {consultant.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    {query.status !== "resolved" &&
                        user &&
                        (user.role === "admin" ||
                            (user.role === "customer" &&
                                user._id === query.customer?._id)) && (
                            <div className="flex justify-end mb-4">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowResolveModal(true)}
                                >
                                    Resolve Query
                                </button>
                            </div>
                        )}
                    {query.responses && query.responses.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                                Responses
                            </h2>
                            <div className="space-y-2">
                                {query.responses.map((resp, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-gray-50 dark:bg-gray-900 p-3 rounded"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium">
                                                {resp.user?.name}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(
                                                    resp.createdAt,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-gray-700 dark:text-gray-100">
                                            {resp.message}
                                            {/* WhatsApp-like preview for file attachments in responses */}
                                            {resp.file && resp.file.key && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    {resp.file.filename?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                        <a
                                                            href="#"
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                const url = await getSignedUrl(resp.file!.key!);
                                                                window.open(url, "_blank");
                                                            }}
                                                        >
                                                            <img
                                                                src={signedImageUrls[resp.file.key] || ""}
                                                                alt={resp.file.filename}
                                                                className="h-16 w-16 object-cover rounded border"
                                                            />
                                                        </a>
                                                    ) : resp.file.filename?.toLowerCase().endsWith(".pdf") ? (
                                                        <a
                                                            href="#"
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                const url = await getSignedUrl(resp.file!.key!);
                                                                window.open(url, "_blank");
                                                            }}
                                                            className="flex items-center gap-1 text-blue-600 underline"
                                                        >
                                                            <span role="img" aria-label="PDF">📄</span> {resp.file.filename}
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href="#"
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                const url = await getSignedUrl(resp.file!.key!);
                                                                window.open(url, "_blank");
                                                            }}
                                                            className="flex items-center gap-1 text-blue-600 underline"
                                                        >
                                                            <span role="img" aria-label="File">📎</span> {resp.file.filename}
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Response form for admin, customer, or assigned consultant, if not resolved */}
                    {query.status !== "resolved" &&
                        user &&
                        (user.role === "admin" ||
                            (user.role === "customer" &&
                                user._id === query.customer?._id) ||
                            (user.role === "consultant" &&
                                query.consultant &&
                                user._id ===
                                    (typeof query.consultant === "object"
                                        ? query.consultant._id
                                        : query.consultant))) && (
                            <form
                                onSubmit={handleSubmit}
                                className="bg-gray-50 p-4 rounded mt-6 space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="response"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Your Response
                                    </label>
                                    <textarea
                                        id="response"
                                        value={response}
                                        onChange={(e) =>
                                            setResponse(e.target.value)
                                        }
                                        rows={4}
                                        className="mt-1 block w-full border border-gray-300 bg-white p-3 rounded text-gray-700 focus:border-primary focus:ring-primary sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="responseFile"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Attach File (optional)
                                    </label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <label
                                            htmlFor="responseFile"
                                            className="btn btn-secondary cursor-pointer"
                                        >
                                            Choose file
                                        </label>
                                        <input
                                            id="responseFile"
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleResponseFileChange}
                                            className="hidden"
                                        />
                                        {responseFile && (
                                            <span className="text-gray-800 dark:text-gray-200">{responseFile.name}</span>
                                        )}
                                    </div>
                                    {/* WhatsApp-like preview for file being uploaded */}
                                    {responseFile && filePreviewUrl && (
                                        <div className="mt-2 flex items-center gap-2">
                                            {responseFile.type.startsWith("image/") ? (
                                                <img
                                                    src={filePreviewUrl}
                                                    alt="Preview"
                                                    className="h-16 w-16 object-cover rounded border"
                                                />
                                            ) : responseFile.type === "application/pdf" ? (
                                                <span className="flex items-center gap-1 text-gray-800">
                                                    <span role="img" aria-label="PDF">📄</span> {responseFile.name}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-800">
                                                    <span role="img" aria-label="File">📎</span> {responseFile.name}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Submit Response
                                    </button>
                                </div>
                            </form>
                        )}

                    {/* Assign Confirmation Modal */}
                    <Modal
                        open={showAssignModal}
                        onClose={() => setShowAssignModal(false)}
                        onConfirm={() => {
                            if (pendingConsultantId)
                                handleAssignConsultant(pendingConsultantId);
                            setShowAssignModal(false);
                            setPendingConsultantId(null);
                        }}
                        title="Assign Consultant"
                        description="Are you sure you want to assign this query to the selected consultant? This action is irreversible."
                        confirmText="Assign"
                        cancelText="Cancel"
                    />

                    {/* Resolve Confirmation Modal */}
                    <Modal
                        open={showResolveModal}
                        onClose={() => setShowResolveModal(false)}
                        onConfirm={handleResolve}
                        title="Resolve Query"
                        description="Are you sure you want to resolve this query? This action is irreversible."
                        confirmText="Resolve"
                        cancelText="Cancel"
                    />
                </div>
            </div>
        </Layout>
    );
}
