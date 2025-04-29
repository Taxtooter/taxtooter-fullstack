import { Toaster } from "react-hot-toast";

export default function Toast() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: "#fff",
                    color: "#333",
                    boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    borderRadius: "0.375rem",
                    padding: "0.75rem 1rem",
                },
                success: {
                    style: {
                        background: "#f0fdf4",
                        color: "#166534",
                        border: "1px solid #bbf7d0",
                    },
                    iconTheme: {
                        primary: "#166534",
                        secondary: "#f0fdf4",
                    },
                },
                error: {
                    style: {
                        background: "#fef2f2",
                        color: "#991b1b",
                        border: "1px solid #fecaca",
                    },
                    iconTheme: {
                        primary: "#991b1b",
                        secondary: "#fef2f2",
                    },
                },
            }}
        />
    );
}
