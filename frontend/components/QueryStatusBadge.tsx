import { Query } from "../types";

interface QueryStatusBadgeProps {
    query: Query;
}

export default function QueryStatusBadge({ query }: QueryStatusBadgeProps) {
    const getStatusColor = (query: Query) => {
        if (query.status === "resolved") return "bg-green-100 text-green-800";
        if (query.status === "assigned") return "bg-blue-100 text-blue-800";
        if (query.status === "open") {
            if (!query.responses || query.responses.length === 0) {
                return "bg-red-100 text-red-800"; // Unanswered
            }
            return "bg-yellow-100 text-yellow-800"; // Unassigned
        }
        return "bg-red-100 text-red-800";
    };

    const getDisplayStatus = (query: Query) => {
        if (query.status === "resolved") return "Resolved";
        if (query.status === "assigned") return "Assigned";
        if (query.status === "open") {
            // If query is open and has no responses, it's unanswered
            if (!query.responses || query.responses.length === 0) {
                return "Unanswered";
            }
            return "Unassigned";
        }
        return query.status;
    };

    return (
        <span className={`px-2 py-1 rounded ${getStatusColor(query)}`}>
            {getDisplayStatus(query)}
        </span>
    );
}
