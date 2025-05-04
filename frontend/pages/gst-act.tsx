import Link from "next/link";

export default function GSTAct() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">TaxTooter</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/gst-act" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                                GST Act
                            </Link>
                            <Link href="/gst-rules" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                                GST Rules
                            </Link>
                            <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                                Login
                            </Link>
                            <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-500">
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">GST Act</h1>
                    <div className="prose max-w-none">
                        <p className="text-gray-600 dark:text-gray-300">
                            The Goods and Services Tax (GST) Act is a comprehensive tax reform that was implemented in India on July 1, 2017. It replaced multiple indirect taxes levied by the central and state governments with a single tax.
                        </p>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Key Features</h2>
                        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-700 dark:text-gray-200">
                            <li>One Nation, One Tax</li>
                            <li>Input Tax Credit</li>
                            <li>Dual GST Structure</li>
                            <li>Composition Scheme</li>
                            <li>Threshold Exemption</li>
                        </ul>
                        <div className="mt-8">
                            <p className="text-gray-600 dark:text-gray-300">
                                This section will be updated with detailed information about the GST Act, including:
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-700 dark:text-gray-200">
                                <li>Complete text of the GST Act</li>
                                <li>Important sections and provisions</li>
                                <li>Latest amendments</li>
                                <li>Case studies and interpretations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 