import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
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
}

export default function AllQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await axios.get('/api/queries', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setQueries(response.data);
      } catch (err) {
        setError('Failed to fetch queries');
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">All Queries</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
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
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
} 