import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Link from 'next/link';

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
  responses?: {
    user: {
      name: string;
    };
    message: string;
    createdAt: string;
  }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        let endpoint = '';
        if (user?.role === 'customer') {
          endpoint = '/api/queries/my-queries';
        } else if (user?.role === 'consultant') {
          endpoint = '/api/queries/assigned';
        } else if (user?.role === 'admin') {
          endpoint = '/api/queries';
        }

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Ensure response.data is an array
        const data = Array.isArray(response.data) ? response.data : [];
        setQueries(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching queries:', error);
        setError('Failed to fetch queries');
        setQueries([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchQueries();
    }
  }, [user]);

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
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'customer' && 'My Queries'}
            {user?.role === 'consultant' && 'Assigned Queries'}
            {user?.role === 'admin' && 'All Queries'}
          </h1>
          <div className="space-x-4">
            {user?.role === 'customer' && (
              <Link
                href="/queries/new"
                className="btn btn-primary"
              >
                New Query
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                href="/create-consultant"
                className="btn btn-secondary"
              >
                Create Consultant
              </Link>
            )}
          </div>
        </div>

        {queries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No queries found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {queries.map((query) => (
              <Link
                key={query._id}
                href={`/queries/${query._id}`}
                className="card hover:shadow-lg transition-shadow"
              >
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

                {query.responses && query.responses.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Responses:</h4>
                    <div className="mt-2 space-y-2">
                      {query.responses.map((response, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className="font-medium">{response.user.name}:</span> {response.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 