import Link from 'next/link';
import { Query } from '../types';
import QueryStatusBadge from './QueryStatusBadge';

interface QueryCardProps {
  query: Query;
  showActions?: boolean;
  onAssign?: (queryId: string, consultantId: string) => void;
  consultants?: Array<{ _id: string; name: string }>;
}

const dateOptions: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const day = d.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? 'st' :
                 day % 10 === 2 && day !== 12 ? 'nd' :
                 day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  const month = d.toLocaleString(undefined, { month: 'long' });
  const year = d.getFullYear();
  let hour = d.getHours();
  const minute = d.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  return `${day}${suffix} ${month}, ${year} at ${hour}:${minute} ${ampm}`;
};

export default function QueryCard({ query, showActions = false, onAssign, consultants }: QueryCardProps) {
  return (
    <Link
      href={`/queries/${query._id}`}
      className="card hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="w-full">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{query.title}</h3>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
            <span className="font-medium">Created By:</span> {query.customer?.name}
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            <span className="font-medium">Consultant:</span> {query.consultant?.name || 'N/A'}
          </div>
          <div className="border-t mt-4 pt-2 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-400 border-gray-200 dark:border-gray-700">
            <span>🗓️ <span className="font-medium">Created:</span> {formatDate(query.createdAt)}</span>
            <span>|</span>
            <span>🕒 <span className="font-medium">Updated:</span> {formatDate(query.updatedAt)}</span>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <QueryStatusBadge query={query} />
        </div>
      </div>

      {showActions && query.status === 'open' && consultants && (
        <div className="mt-4">
          <label htmlFor={`consultant-${query._id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Assign to Consultant
          </label>
          <select
            id={`consultant-${query._id}`}
            className="input mt-1"
            onChange={(e) => onAssign && onAssign(query._id, e.target.value)}
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
    </Link>
  );
} 