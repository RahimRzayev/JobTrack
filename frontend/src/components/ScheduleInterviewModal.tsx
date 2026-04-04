import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { JobApplication } from '../types';
import { jobsApi } from '../services/jobsApi';
import toast from 'react-hot-toast';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobApplication | null;
  onScheduled: (id: number, data: Partial<JobApplication>) => void;
}

export default function ScheduleInterviewModal({ isOpen, onClose, job, onScheduled }: ScheduleInterviewModalProps) {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && job?.interview_datetime) {
      const dateObj = new Date(job.interview_datetime);
      // Use local date/time consistently so date and time are in the same reference frame
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      setInterviewDate(`${year}-${month}-${day}`);
      
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const mins = String(dateObj.getMinutes()).padStart(2, '0');
      setInterviewTime(`${hours}:${mins}`);
    } else if (isOpen) {
      setInterviewDate('');
      setInterviewTime('');
    }
  }, [isOpen, job]);

  if (!isOpen || !job) return null;

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime) {
      toast.error('Please select both date and time');
      return;
    }

    setLoading(true);
    try {
      // Combine date and time into ISO string
      const datetime = new Date(`${interviewDate}T${interviewTime}`).toISOString();
      
      const response = await jobsApi.scheduleInterview(job.id, datetime);
      
      onScheduled(job.id, { 
        interview_datetime: datetime,
        calendar_event_id: response.event_id || ''
      });
      
      toast.success(response.message || 'Interview scheduled successfully');
      setInterviewDate('');
      setInterviewTime('');
      onClose();
    } catch (error: any) {
      if (error.response?.status === 401 && error.response?.data?.auth_url) {
        window.location.href = error.response.data.auth_url;
        return;
      }
      toast.error(error.response?.data?.error || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          <form onSubmit={handleSchedule}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Schedule Interview
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">
                      Set the date and time for your interview at <strong className="text-gray-900">{job.company}</strong>. This will automatically sync to Google Calendar if configured.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Interview Date</label>
                        <input
                          type="date"
                          required
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time (Local Time)</label>
                        <input
                          type="time"
                          required
                          value={interviewTime}
                          onChange={(e) => setInterviewTime(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70"
              >
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
