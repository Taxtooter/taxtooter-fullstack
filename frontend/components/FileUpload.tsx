import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    existingFile?: {
        filename?: string;
        key?: string;
    } | null;
    className?: string;
}

export default function FileUpload({ onFileSelect, existingFile, className = "" }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Fetch signed URL for existing file if it's an image
        if (existingFile?.key && existingFile.filename?.match(/\.(jpg|jpeg|png|gif)$/i)) {
            fetch(`/api/upload/signed-url?key=${encodeURIComponent(existingFile.key)}`)
                .then(res => res.json())
                .then(data => setSignedUrl(data.url))
                .catch(err => console.error("Error fetching signed URL:", err));
        }
    }, [existingFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setFilePreviewUrl(URL.createObjectURL(selectedFile));
            onFileSelect(selectedFile);
        } else {
            setFile(null);
            setFilePreviewUrl(null);
            onFileSelect(null);
        }
    };

    const handleFileClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (existingFile?.key) {
            try {
                const res = await fetch(`/api/upload/signed-url?key=${encodeURIComponent(existingFile.key)}`);
                const data = await res.json();
                window.open(data.url, "_blank");
            } catch (err) {
                toast.error("Failed to open file");
            }
        }
    };

    return (
        <div className={className}>
            <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
                Attach File (optional)
            </label>
            <div className="flex items-center gap-2 mt-1">
                <label
                    htmlFor="file"
                    className="btn btn-secondary cursor-pointer"
                >
                    Choose file
                </label>
                <input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                {(file || existingFile) && (
                    <span className="text-gray-900 dark:text-gray-200">
                        {file ? file.name : existingFile?.filename}
                    </span>
                )}
            </div>
            {/* File preview */}
            {(file || existingFile) && (
                <div className="mt-2 flex items-center gap-2">
                    {file ? (
                        // Preview for newly selected file
                        file.type.startsWith("image/") ? (
                            <img
                                src={filePreviewUrl || ""}
                                alt="Preview"
                                className="h-16 w-16 object-cover rounded border"
                            />
                        ) : file.type === "application/pdf" ? (
                            <span className="flex items-center gap-1 text-gray-900 dark:text-gray-200">
                                <span role="img" aria-label="PDF">📄</span> {file.name}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-gray-900 dark:text-gray-200">
                                <span role="img" aria-label="File">📎</span> {file.name}
                            </span>
                        )
                    ) : existingFile ? (
                        // Preview for existing file
                        existingFile.filename?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <a
                                href="#"
                                onClick={handleFileClick}
                                className="cursor-pointer"
                            >
                                <img
                                    src={signedUrl || ""}
                                    alt={existingFile.filename}
                                    className="h-16 w-16 object-cover rounded border"
                                />
                            </a>
                        ) : existingFile.filename?.match(/\.pdf$/i) ? (
                            <a
                                href="#"
                                onClick={handleFileClick}
                                className="flex items-center gap-1 text-blue-400 dark:text-blue-300 underline cursor-pointer"
                            >
                                <span role="img" aria-label="PDF">📄</span> {existingFile.filename}
                            </a>
                        ) : (
                            <a
                                href="#"
                                onClick={handleFileClick}
                                className="flex items-center gap-1 text-blue-400 dark:text-blue-300 underline cursor-pointer"
                            >
                                <span role="img" aria-label="File">📎</span> {existingFile.filename}
                            </a>
                        )
                    ) : null}
                </div>
            )}
        </div>
    );
} 