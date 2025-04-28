import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Query, User } from '../../types';
import { toast } from 'react-hot-toast';
import QueryCard from '../../components/QueryCard';

export default function AdminQueries() {
  const { user } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const [consultants, setConsultants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [queriesResponse, consultantsResponse] = await Promise.all([
          axios.get('/api/queries', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get('/api/users?role=consultant', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);
        
        setQueries(queriesResponse.data);
        setConsultants(consultantsResponse.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const handleAssignQuery = async (queryId: string, consultantId: string) => {
    try {
      await axios.post(`/api/queries/${queryId}/assign`, { consultantId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Query assigned successfully');
      // Refresh queries
      const response = await axios.get('/api/queries', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setQueries(response.data);
    } catch (error) {
      console.error('Error assigning query:', error);
      toast.error('Failed to assign query');
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
            <QueryCard
              key={query._id}
              query={query}
              showActions={true}
              onAssign={handleAssignQuery}
              consultants={consultants}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
} 