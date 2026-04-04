import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { JobApplication } from '../types';
import { jobsApi } from '../services/jobsApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobApplication;
}

export default function CoverLetterModal({ isOpen, onClose, job }: CoverLetterModalProps) {
  const { user } = useAuth();
  const [tone, setTone] = useState<'formal' | 'friendly'>('formal');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLetter(null);
      setLoading(false);
      setDownloading(false);
    }
  }, [isOpen, job.id]);

  if (!isOpen) return null;

  const cvPdfUrl = user?.cv_pdf;

  const handleGenerate = async () => {
    if (!cvPdfUrl) {
      toast.error('Please upload your CV PDF in your Profile first');
      return;
    }

    setLoading(true);
    try {
      const jobDescription = job.description || `${job.position} at ${job.company}\nLocation: ${job.location || 'Not specified'}`;
      const result = await jobsApi.generateCoverLetter(jobDescription, tone);
      setLetter(result.cover_letter);
      toast.success('Cover letter generated!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (letter) {
      navigator.clipboard.writeText(letter);
      toast.success('Copied to clipboard');
    }
  };

  const handleDownload = async () => {
    if (!letter) return;
    setDownloading(true);
    try {
      const blob = await jobsApi.downloadCoverLetter(letter, job.company);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cover_Letter_${job.company.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold leading-6 text-gray-900">
              AI Cover Letter Architect
            </h3>
            <p className="text-sm text-gray-500 mt-1">Generating for {job.position} role at {job.company}</p>
          </div>

          <div className="bg-white px-4 py-5 sm:p-6 flex flex-col md:flex-row gap-6">
            {/* Input Column */}
            <div className={`flex-1 transition-all ${letter ? 'w-1/3 opacity-70' : 'w-full'}`}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Tone</label>
                <div className="flex rounded-md shadow-sm w-full">
                  <button
                    onClick={() => setTone('formal')}
                    className={`flex-1 flex justify-center py-2 px-4 border text-sm font-medium rounded-l-md ${
                      tone === 'formal' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Formal
                  </button>
                  <button
                    onClick={() => setTone('friendly')}
                    className={`flex-1 flex justify-center py-2 px-4 border-y border-r text-sm font-medium rounded-r-md ${
                      tone === 'friendly' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Friendly
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume / CV Context</label>
                {cvPdfUrl ? (
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-600">
                    <div className="flex items-center mb-1">
                      <svg className="w-5 h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <strong>PDF CV Found</strong>
                    </div>
                    <p className="pl-7 mt-1 text-indigo-500 font-medium">Using your Master CV PDF from Profile</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-700">
                      No Master CV PDF found on your profile. Please upload it to use AI generation.
                    </p>
                    <Link to="/profile" className="mt-2 inline-block font-medium text-yellow-700 hover:text-yellow-600 underline text-sm">
                      Go to Profile
                    </Link>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !cvPdfUrl}
                className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : letter ? 'Regenerate Letter' : 'Generate Cover Letter'}
              </button>
            </div>

            {/* Output Column */}
            {letter && (
              <div className="flex-1 flex flex-col pt-2 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Generated Cover Letter</label>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded"
                    >
                      <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="inline-flex items-center text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded disabled:opacity-70"
                    >
                      {downloading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-md border border-gray-200 p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto max-h-[500px]">
                  {letter}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
