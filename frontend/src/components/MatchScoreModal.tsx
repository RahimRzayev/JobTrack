import { useState } from 'react';
import { createPortal } from 'react-dom';
import { JobApplication, MatchScoreResult } from '../types';
import { jobsApi } from '../services/jobsApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface MatchScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobApplication;
  onScoreUpdated: (score: number) => void;
}

export default function MatchScoreModal({ isOpen, onClose, job, onScoreUpdated }: MatchScoreModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchScoreResult | null>(null);

  if (!isOpen) return null;

  const cvPdfUrl = (user as any)?.cv_pdf;

  const handleCheckMatch = async () => {
    if (!cvPdfUrl) {
      toast.error('Please upload your CV PDF in your Profile first');
      return;
    }

    setLoading(true);
    try {
      const scoreResult = await jobsApi.getMatchScore(job.id);
      setResult(scoreResult);
      onScoreUpdated(scoreResult.score);
      toast.success('AI Match Analysis complete!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to analyze match score');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
              AI Match Analysis: {job.position} @ {job.company}
            </h3>
            
            {!result ? (
              <div className="mt-4">
                {cvPdfUrl ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">
                      We will use your stored Master CV PDF to analyze how well you match this role.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600 flex items-center">
                      <svg className="w-5 h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Stored CV PDF is ready for analysis.
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          We didn't find a Master CV on your profile. You need to save your CV to use AI analysis.
                        </p>
                        <p className="mt-3 text-sm">
                          <Link to="/profile" className="font-medium text-yellow-700 hover:text-yellow-600 underline">
                            Go to Profile to save CV
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                <div className="flex flex-col items-center justify-center py-6 border rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-500 mb-1">Overall Match Score</span>
                  <div className={`text-4xl font-bold px-6 py-3 rounded-full ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Missing Keywords
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-red-700 mt-2">
                      {result.missing_keywords && result.missing_keywords.length > 0 ? (
                        result.missing_keywords.map((kw, i) => <li key={i}>{kw}</li>)
                      ) : (
                        <li>No missing critical keywords found. Great match!</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            {!result ? (
              <button
                type="button"
                onClick={handleCheckMatch}
                disabled={loading || !cvPdfUrl}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70"
              >
                {loading ? 'Analyzing...' : 'Analyze Match'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            )}
            {!result && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
