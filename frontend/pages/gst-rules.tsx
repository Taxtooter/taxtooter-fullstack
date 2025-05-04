import Link from "next/link";
import Layout from "../components/Layout";

export default function GSTRules() {
    return (
        <Layout>
            {/* Hero Section-like wrapper for consistent spacing */}
            <div className="relative bg-white dark:bg-gray-800 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white dark:bg-gray-800 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-2 mx-auto max-w-7xl px-4 sm:mt-2 sm:px-6 md:mt-2 lg:mt-2 lg:px-8 xl:mt-2">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">GST Rules</h1>
                                <div className="prose max-w-none">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        The GST Rules provide detailed procedures and guidelines for implementing the provisions of the GST Act. These rules cover various aspects of GST compliance, including registration, returns, payments, and refunds.
                                    </p>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Key Areas Covered</h2>
                                    <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-700 dark:text-gray-200">
                                      <li>
                                        <strong>Registration Rules</strong>
                                        <ul className="ml-6 list-disc">
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009516/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 8: Application for registration
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009517/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 9: Verification of the application and approval
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009518/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 10: Issue of registration certificate
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009519/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 11: Separate registration for multiple places of business
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009520/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 12: Grant of registration to persons required to deduct tax at source or to collect tax at source
                                            </a>
                                          </li>
                                        </ul>
                                      </li>
                                      <li>
                                        <strong>Invoice Rules</strong>
                                        <ul className="ml-6 list-disc">
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009523/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 46: Tax invoice
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009524/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 47: Time limit for issuing tax invoice
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009525/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 48: Manner of issuing invoice (including e-invoice)
                                            </a>
                                          </li>
                                        </ul>
                                      </li>
                                      <li>
                                        <strong>Payment Rules</strong>
                                        <ul className="ml-6 list-disc">
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009530/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 85: Electronic liability register
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009531/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 86: Electronic credit ledger
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009532/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 87: Electronic cash ledger
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009533/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 88: Identification number for each transaction
                                            </a>
                                          </li>
                                        </ul>
                                      </li>
                                      <li>
                                        <strong>Return Rules</strong>
                                        <ul className="ml-6 list-disc">
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009526/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 59: Form and manner of furnishing details of outward supplies
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009527/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 60: Form and manner of furnishing details of inward supplies
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009528/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 61: Form and manner of submission of monthly return
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009529/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 62: Form and manner of submission of quarterly return by the composition supplier
                                            </a>
                                          </li>
                                        </ul>
                                      </li>
                                      <li>
                                        <strong>Refund Rules</strong>
                                        <ul className="ml-6 list-disc">
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009534/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 89: Application for refund of tax, interest, penalty, fees or any other amount
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009535/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 90: Acknowledgement
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009536/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 91: Grant of provisional refund
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009537/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 92: Order sanctioning refund
                                            </a>
                                          </li>
                                        </ul>
                                      </li>
                                      <li>
                                        <strong>Input Tax Credit Rules</strong>
                                        <ul className="ml-6 list-disc">
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009521/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 36: Documentary requirements and conditions for claiming input tax credit
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009522/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 37: Reversal of input tax credit in case of non-payment of consideration
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009523/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 38: Claim of credit by a banking company or a financial institution
                                            </a>
                                          </li>
                                          <li>
                                            <a href="https://taxinformation.cbic.gov.in/view-pdf/1009524/ENG/Rules" target="_blank" rel="noopener noreferrer">
                                              Rule 39: Procedure for distribution of input tax credit by Input Service Distributor (ISD)
                                            </a>
                                          </li>
                                        </ul>
                                      </li>
                                    </ul>
                                    <div className="mt-8">
                                        <p className="text-gray-600 dark:text-gray-300">
                                            This section will be updated with detailed information about the GST Rules, including:
                                        </p>
                                        <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-700 dark:text-gray-200">
                                            <li>Complete text of the GST Rules</li>
                                            <li>Procedural guidelines</li>
                                            <li>Compliance requirements</li>
                                            <li>Practical examples and case studies</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 