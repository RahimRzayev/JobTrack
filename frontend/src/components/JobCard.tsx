import { useState } from 'react';
import { JobApplication } from '../types';
import MatchScoreModal from './MatchScoreModal';
import CoverLetterModal from './CoverLetterModal';

interface JobCardProps {
  job: JobApplication;
  onUpdate?: (id: number, data: Partial<JobApplication>) => void;
  onDelete?: (id: number) => void;
}

export default function JobCard({ job, onUpdate, onDelete }: JobCardProps) {
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'wishlist': return 'bg-gray-100 text-gray-800';
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500 text-white';
    if (score >= 40) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow relative">
        <div className="flex justify-between items-start mb-2">
          <div className="max-w-[70%]">
            <h3 className="text-lg font-semibold text-gray-900 truncate" title={job.position}>
              {job.position}
            </h3>
            <p className="text-sm font-medium text-indigo-600 truncate">{job.company}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 ${getStatusColor(job.status)}`}>
              {job.status_display || job.status}
            </span>
            {job.match_score !== null && (
              <span className={`px-2 py-0.5 rounded text-xs font-bold leading-none ${getScoreColor(job.match_score)}`}>
                {job.match_score}% Match
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-2 text-sm text-gray-500">
          {job.location && (
            <div className="flex items-center">
              <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </div>
          )}
          
          {job.deadline && (
            <div className="flex items-center">
              <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </div>
          )}
          
          {job.interview_datetime && (
            <div className="flex items-center text-purple-600 font-medium">
              <svg className="mr-1.5 h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Interview: {new Date(job.interview_datetime).toLocaleString()}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 flex flex-wrap gap-2">
          <button 
            onClick={() => setIsMatchModalOpen(true)}
            className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded transition-colors font-medium border border-indigo-100"
          >
            Check Match
          </button>
          
          <button 
            onClick={() => setIsCoverModalOpen(true)}
            className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded transition-colors font-medium border border-indigo-100"
          >
            Cover Letter
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="flex space-x-2">
            {job.url && (
              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-900 font-medium flex items-center"
              >
                <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Post
              </a>
            )}
          </div>
          
          <div className="flex space-x-2">
            {onDelete && (
              <button 
                onClick={() => onDelete(job.id)}
                className="text-xs text-red-600 hover:text-red-900 font-medium"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <MatchScoreModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        job={job}
        onScoreUpdated={(score) => {
          if (onUpdate) onUpdate(job.id, { match_score: score });
        }}
      />
      
      <CoverLetterModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        job={job}
      />
    </>
  );
}
