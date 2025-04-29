import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Query } from '../types';
import { toast } from 'react-hot-toast';
import QueryCard from '../components/QueryCard';

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
        toast.error('Failed to fetch queries');
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Queries</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <div className="grid gap-6">
          {queries.map((query) => (
            <QueryCard key={query._id} query={query} />
          ))}
        </div>
      </div>
    </Layout>
  );
} 