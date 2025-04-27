import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface Query {
  _id: string;
  title: string;
  description: string;
  status: string;
  customer: {
    name: string;
    email: string;
  };
  consultant?: {
    name: string;
    email: string;
    _id?: string;
  };
  responses?: {
    user: {
      name: string;
    };
    message: string;
    createdAt: string;
  }[];
}

interface Consultant {
  _id: string;
  name: string;
  email: string;
}

export default function QueryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [query, setQuery] = useState<Query | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Add file state for response form
  const [responseFile, setResponseFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchQuery = async () => {
      if (!id) return;
      
      try {
        const response = await axios.get(`/api/queries/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setQuery(response.data);
        setError('');
      } catch (error: any) {
        setError(error.response?.data?.message || 'Error fetching query');
      } finally {
        setLoading(false);
      }
    };

    fetchQuery();
  }, [id]);

  useEffect(() => {
    // Fetch consultants if admin
    const fetchConsultants = async () => {
      if (user?.role === 'admin') {
        try {
          const res = await axios.get('/api/users/consultants', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setConsultants(res.data);
        } catch (err) {
          // ignore for now
        }
      }
    };
    fetchConsultants();
  }, [user]);

  const handleResponseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResponseFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !response.trim()) return;

    try {
      const formData = new FormData();
      formData.append('response', response.trim());
      if (responseFile) formData.append('file', responseFile);
      await axios.post(`/api/queries/${query._id}/respond`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh the query to show the new response
      const updatedResponse = await axios.get(`/api/queries/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setQuery(updatedResponse.data);
      setResponse('');
      setResponseFile(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error submitting response');
    }
  };

  const handleAssignConsultant = async (consultantId: string) => {
    if (!query) return;
    setAssignLoading(true);
    try {
      await axios.post(`/api/queries/${query._id}/assign`, { consultantId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh query
      const updatedResponse = await axios.get(`/api/queries/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setQuery(updatedResponse.data);
    } catch (err) {
      // Optionally show error
    } finally {
      setAssignLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!query) return;
    setShowResolveModal(false);
    try {
      await axios.post(`/api/queries/${query._id}/resolve`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh the query to show the new status
      const updatedResponse = await axios.get(`/api/queries/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setQuery(updatedResponse.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error resolving query');
    }
  };

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

  if (!query) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Query not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{query.title}</h1>
              <p className="mt-2 text-gray-600">{query.description}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              query.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
              query.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
              query.status === 'resolved' ? 'bg-green-100 text-green-800' : ''
            }`}>
              {query.status}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <span className="font-medium text-gray-700">Customer:</span>
              <span className="ml-2 text-gray-600">{query.customer.name}</span>
            </div>
            {query.consultant && (
              <div>
                <span className="font-medium text-gray-700">Consultant:</span>
                <span className="ml-2 text-gray-600">{query.consultant.name}</span>
              </div>
            )}
          </div>

          {query.responses && query.responses.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Responses</h2>
              <div className="space-y-4">
                {query.responses.map((response, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-700">{response.user.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(response.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{response.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Form */}
          {(
            (user?.role === 'consultant' && query.status === 'assigned') ||
            (user?.role === 'customer' && query.customer.email === user.email && query.status !== 'resolved') ||
            (user?.role === 'admin')
          ) && (
            <form onSubmit={handleSubmit} className="mt-6" encType="multipart/form-data">
              <div>
                <label htmlFor="response" className="block text-sm font-medium text-gray-700">
                  {user?.role === 'consultant' ? 'Your Response' : 
                   user?.role === 'admin' ? 'Admin Comment' : 'Add a Comment'}
                </label>
                <textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  required
                  rows={4}
                  placeholder={user?.role === 'consultant' ? 'Type your response here...' : 
                             user?.role === 'admin' ? 'Type your comment here...' : 'Type your comment here...'}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Attach a file (optional):</label>
                <input type="file" onChange={handleResponseFileChange} />
                {responseFile && <div className="text-xs text-gray-500 mt-1">Selected: {responseFile.name}</div>}
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {user?.role === 'consultant' ? 'Submit Response' : 
                   user?.role === 'admin' ? 'Add Admin Comment' : 'Add Comment'}
                </button>
                {/* Mark as Resolved Button (Customer or Admin, if not resolved) */}
                {query.status !== 'resolved' && (
                  (user?.role === 'admin' || (user?.role === 'customer' && query.customer.email === user.email)) && (
                    <button
                      type="button"
                      onClick={() => setShowResolveModal(true)}
                      className="btn border border-primary text-primary bg-transparent hover:bg-primary/10"
                    >
                      Mark as Resolved
                    </button>
                  )
                )}
              </div>
            </form>
          )}

          {/* Assign to Consultant (Admin only, open queries) */}
          {user?.role === 'admin' && query.status === 'open' && (
            <div className="mt-6">
              <label htmlFor="consultant-select" className="block text-sm font-medium text-gray-700">
                Assign to Consultant
              </label>
              <select
                id="consultant-select"
                className="input mt-1"
                onChange={e => handleAssignConsultant(e.target.value)}
                defaultValue=""
                disabled={assignLoading}
              >
                <option value="" disabled>Select a consultant</option>
                {consultants.map(consultant => (
                  <option key={consultant._id} value={consultant._id}>
                    {consultant.name} ({consultant.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Confirmation Modal for Mark as Resolved */}
        {showResolveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold mb-2">Confirm Resolution</h2>
              <p className="mb-4 text-gray-700">Are you sure you want to mark this query as resolved? <b>This action is irreversible.</b></p>
              <div className="flex justify-end gap-4">
                <button
                  className="btn border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                  onClick={() => setShowResolveModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn border border-primary text-primary bg-transparent hover:bg-primary/10"
                  onClick={handleResolve}
                >
                  Yes, Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 