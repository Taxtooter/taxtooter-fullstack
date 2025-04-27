import { useEffect, useState } from 'react';
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
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function AdminQueries() {
  const { user } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const [consultants, setConsultants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [queriesResponse, consultantsResponse] = await Promise.all([
          axios.get('/api/queries', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get('/api/users/consultants', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);
        setQueries(queriesResponse.data);
        setConsultants(consultantsResponse.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignQuery = async (queryId: string, consultantId: string) => {
    try {
      await axios.patch(
        `/api/queries/${queryId}/assign`,
        { consultantId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      // Refresh queries
      const response = await axios.get('/api/queries', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setQueries(response.data);
    } catch (err) {
      setError('Failed to assign query');
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

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Queries</h1>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div className="grid gap-6">
          {queries.map((query) => (
            <div key={query._id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{query.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{query.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  query.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  query.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {query.status}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Customer:</span> {query.customer.name}
                </div>
                {query.consultant && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Consultant:</span> {query.consultant.name}
                  </div>
                )}
              </div>

              {query.status === 'open' && (
                <div className="mt-4">
                  <label htmlFor={`consultant-${query._id}`} className="block text-sm font-medium text-gray-700">
                    Assign to Consultant
                  </label>
                  <select
                    id={`consultant-${query._id}`}
                    className="input mt-1"
                    onChange={(e) => handleAssignQuery(query._id, e.target.value)}
                  >
                    <option value="">Select a consultant</option>
                    {consultants.map((consultant) => (
                      <option key={consultant._id} value={consultant._id}>
                        {consultant.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 