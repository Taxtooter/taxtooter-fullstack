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
  response?: string;
}

export default function AssignedQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await axios.get('/api/queries/assigned', {
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

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery) return;

    try {
      await axios.post(
        `/api/queries/${selectedQuery._id}/respond`,
        { response },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setQueries(queries.map(q => 
        q._id === selectedQuery._id 
          ? { ...q, response, status: 'resolved' }
          : q
      ));
      setSelectedQuery(null);
      setResponse('');
    } catch (err) {
      setError('Failed to submit response');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Assigned Queries</h1>
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
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Customer:</span> {query.customer.name}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  query.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  query.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {query.status}
                </span>
              </div>
              {query.response && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Your Response:</h4>
                  <p className="mt-1 text-sm text-gray-500">{query.response}</p>
                </div>
              )}
              {!query.response && query.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    window.location.href = `/queries/${query._id}`;
                  }}
                  className="mt-4 btn btn-primary"
                >
                  Respond
                </button>
              )}
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
} 