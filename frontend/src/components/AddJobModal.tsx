import { useState } from 'react';
import { createPortal } from 'react-dom';
import { JobApplication } from '../types';
import { jobsApi } from '../services/jobsApi';
import toast from 'react-hot-toast';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<JobApplication>) => Promise<void>;
}

export default function AddJobModal({ isOpen, onClose, onSubmit }: AddJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    url: '',
    status: 'wishlist',
    deadline: '',
    description: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScrape = async () => {
    if (!formData.url) {
      toast.error('Please enter a valid URL first');
      return;
    }
    
    setScraping(true);
    try {
      const data = await jobsApi.scrapeJob({ url: formData.url });
      console.log('[JobTrack] Scrape API result:', data);
      setFormData(prev => ({
        ...prev,
        company: data.company || prev.company,
        position: data.position || prev.position,
        location: data.location || prev.location,
        deadline: data.deadline || prev.deadline,
        description: data.description || prev.description,
      }));
      const filled = [data.company, data.position, data.location, data.description].filter(Boolean).length;
      if (filled > 0) {
        toast.success(`Auto-filled ${filled} field(s) successfully!`);
      } else {
        toast('Could not extract details — the site may block scraping. Try a direct job posting URL.', {
          icon: '⚠️',
          duration: 6000,
        });
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || '';
      if (msg.includes('SCRAPING_BLOCKED') || msg.includes('SCRAPING_FAILED') || msg.includes('invalid_content_detected') || msg.includes('anti-bot') || msg.includes('403')) {
        setFormData(prev => ({ ...prev, description: '' }));
        
        if (formData.url.toLowerCase().includes('linkedin.com')) {
          toast.error("LinkedIn has blocked automated access. Please copy the job text from your browser tab and paste it into the 'Job Description' box below.", { duration: 6000 });
        } else {
          toast.error("Automated access to this site is currently limited. Please paste the job details manually below.", { duration: 6000 });
        }
      } else {
        toast.error('Scraping failed. Please enter the details manually or paste the Job Description below to continue.', { duration: 6000 });
      }
    } finally {
      setScraping(false);
    }
  };

  const handleManualScanAI = async () => {
    if (!formData.description) {
      toast.error('Please paste the job description first');
      return;
    }
    setScraping(true);
    try {
      const data = await jobsApi.scrapeJob({ text: formData.description });
      setFormData(prev => ({
        ...prev,
        company: data.company || prev.company,
        position: data.position || prev.position,
        location: data.location || prev.location,
        deadline: data.deadline || prev.deadline,
      }));
      toast.success('Successfully extracted details from description!');
    } catch (error: any) {
      const msg = error.response?.data?.error || '';
      if (msg.includes('invalid_content_detected')) {
         toast.error("The pasted text does not appear to be a valid job posting.");
      } else {
         toast.error("Failed to extract details from text.");
      }
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Clean up empty dates so they become null
      const dataToSubmit: any = { ...formData };
      if (!dataToSubmit.deadline) delete dataToSubmit.deadline;
      
      await onSubmit(dataToSubmit as Partial<JobApplication>);
      // Reset form
      setFormData({
        company: '', position: '', location: '', url: '', status: 'wishlist', deadline: '', description: '', notes: ''
      });
      onClose();
    } catch (error: any) {
      const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error('Failed to add job validation:', msg);
      toast.error(`Validation Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Job Application</h3>
              
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                  <label className="block text-sm font-medium text-indigo-800">Quick Add via URL</label>
                  <p className="text-xs text-indigo-600 mb-2">Paste a job posting URL and let AI auto-fill the details.</p>
                  <div className="flex gap-2">
                    <input
                      name="url"
                      type="url"
                      placeholder="https://example.com/job/123"
                      value={formData.url}
                      onChange={handleChange}
                      className="flex-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleScrape}
                      disabled={scraping || !formData.url}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {scraping ? 'Analyzing...' : 'Auto-fill'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company *</label>
                    <input
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position *</label>
                    <input
                      name="position"
                      type="text"
                      required
                      value={formData.position}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="wishlist">Wishlist</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700">Deadline</label>
                  <input
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-700">Job Description</label>
                    <button
                      type="button"
                      onClick={handleManualScanAI}
                      disabled={scraping || !formData.description}
                      className="inline-flex items-center text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200 disabled:opacity-50"
                    >
                      Extract Details with AI
                    </button>
                  </div>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Auto-filled via URL scraper, or paste the manual posting texts here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={loading || !formData.company || !formData.position}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Job'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
