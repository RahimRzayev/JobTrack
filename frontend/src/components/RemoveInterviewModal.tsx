import { useState } from 'react';
import { createPortal } from 'react-dom';
import { JobApplication } from '../types';
import { jobsApi } from '../services/jobsApi';
import toast from 'react-hot-toast';

interface RemoveInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobApplication | null;
  onRemoved: (id: number) => void;
  onKept: () => void;
}

export default function RemoveInterviewModal({ isOpen, onClose, job, onRemoved, onKept }: RemoveInterviewModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !job) return null;

  const hasInterview = !!job.interview_datetime;

  const handleRemove = async () => {
    setLoading(true);
    try {
      await jobsApi.removeInterview(job.id);
      toast.success('Interview removed from calendar');
      onRemoved(job.id);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove interview');
    } finally {
      setLoading(false);
    }
  };

  const handleKeep = () => {
    onKept();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleKeep} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Moving from Interviewing
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You're moving <strong className="text-gray-900">{job.position} at {job.company}</strong> out of Interviewing.
                  </p>
                  {hasInterview && (
                    <p className="text-sm text-gray-500 mt-2">
                      This job has an interview scheduled for <strong className="text-gray-900">{new Date(job.interview_datetime!).toLocaleString()}</strong>. Would you like to remove it from your calendar?
                    </p>
                  )}
                  {!hasInterview && (
                    <p className="text-sm text-gray-500 mt-2">
                      No interview date is set for this job.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row-reverse sm:px-6 gap-2">
            {hasInterview && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto sm:text-sm disabled:opacity-70"
              >
                {loading ? 'Removing...' : 'Remove Interview'}
              </button>
            )}
            <button
              type="button"
              onClick={handleKeep}
              disabled={loading}
              className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto sm:text-sm"
            >
              {hasInterview ? 'Keep Interview' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
