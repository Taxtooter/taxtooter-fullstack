import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { logger } from '../../lib/logger';
import { Query, Consultant, User } from '../../types';
import { toast } from 'react-hot-toast';
import QueryStatusBadge from '../../components/QueryStatusBadge';

export default function QueryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [query, setQuery] = useState<Query | null>(null);
  const [consultant, setConsultant] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Add file state for response form
  const [responseFile, setResponseFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchQuery = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/queries/${id}`);
        setQuery(response.data);
        console.log('Fetched query:', response.data);
      } catch (err) {
        logger.error('Error fetching query', err);
        setError('Failed to load query details');
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
      if (user?.role === 'admin') {
        try {
          const res = await api.get('/api/users/consultants', {
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
      await api.post(`/api/queries/${query._id}/respond`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh the query to show the new response
      const updatedResponse = await api.get(`/api/queries/${id}`, {
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
      await api.post(`/api/queries/${query._id}/assign`, { consultantId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Consultant assigned successfully');
      // Refresh query
      const updatedResponse = await api.get(`/api/queries/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setQuery(updatedResponse.data);
    } catch (err) {
      toast.error('Failed to assign consultant');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!query) return;
    setShowResolveModal(false);
    try {
      await api.post(`/api/queries/${query._id}/resolve`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Query resolved successfully');
      // Refresh the query to show the new status
      const updatedResponse = await api.get(`/api/queries/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setQuery(updatedResponse.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resolve query');
    }
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
            {error || 'Query not found'}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">{query.title}</h1>
          <div className="mb-4">
            <p className="text-gray-600">{query.description}</p>
          </div>
          <div className="mb-4">
            <span className="text-sm text-gray-500">Status: </span>
            <QueryStatusBadge query={query} />
          </div>
          <div className="mb-4">
            <span className="text-sm text-gray-500">Customer: </span>
            <span className="font-medium">{query.customer?.name} ({query.customer?.email})</span>
          </div>
          {query.consultant && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">Consultant: </span>
              <span className="font-medium">{query.consultant.name} ({query.consultant.email})</span>
            </div>
          )}
          {query.responses && query.responses.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Responses</h2>
              <div className="space-y-2">
                {query.responses.map((resp, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{resp.user?.name}</span>
                      <span className="text-xs text-gray-400">{new Date(resp.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-gray-700">{resp.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response form for admin, customer, or assigned consultant, if not resolved */}
          {query.status !== 'resolved' && user && (
            (user.role === 'admin' ||
              (user.role === 'customer' && user._id === query.customer?._id) ||
              (user.role === 'consultant' && query.consultant && user._id === (typeof query.consultant === 'object' ? query.consultant._id : query.consultant))) && (
              <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded mt-6 space-y-4">
                <div>
                  <label htmlFor="response" className="block text-sm font-medium text-gray-700">Your Response</label>
                  <textarea
                    id="response"
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 bg-white p-3 rounded text-gray-700 focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="responseFile" className="block text-sm font-medium text-gray-700">Attach File (optional)</label>
                  <input
                    id="responseFile"
                    type="file"
                    onChange={handleResponseFileChange}
                    className="mt-1 block w-full text-sm text-gray-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary">Submit Response</button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </Layout>
  );
} 