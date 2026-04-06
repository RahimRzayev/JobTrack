import { useState, useEffect } from 'react';
import { JobApplication } from '../types';
import { jobsApi } from '../services/jobsApi';
import JobCard from '../components/JobCard';
import AddJobModal from '../components/AddJobModal';
import toast from 'react-hot-toast';

export default function JobListPage() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getAll(statusFilter === 'all' ? undefined : statusFilter);
      setJobs(data);
    } catch (error) {
      toast.error('Failed to load job applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [statusFilter]);

  const handleAddJob = async (data: Partial<JobApplication>) => {
    try {
      await jobsApi.create(data);
      toast.success('Job application added!');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to add job application');
      throw error;
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      await jobsApi.delete(id);
      setJobs(prev => prev.filter(job => job.id !== id));
      toast.success('Job application deleted');
    } catch (error) {
      toast.error('Failed to delete job application');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.company.toLowerCase().includes(query) ||
      job.position.toLowerCase().includes(query) ||
      (job.location && job.location.toLowerCase().includes(query))
    );
  });

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'wishlist', label: 'Wishlist' },
    { value: 'applied', label: 'Applied' },
    { value: 'interviewing', label: 'Interviews' },
    { value: 'offer', label: 'Offers' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>My Applications</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-slate)' }}>
            {filteredJobs.length} application{filteredJobs.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="studio-btn primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Job
        </button>
      </div>

      {/* Search & Filters */}
      <div className="studio-card p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-stone)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 text-sm"
            placeholder="Search companies, roles, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`filter-chip ${statusFilter === status.value ? 'active' : ''}`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--color-coral)', borderTopColor: 'transparent' }} />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="studio-card text-center py-16 px-6">
          <svg className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--color-stone)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-charcoal)' }}>No applications found</h3>
          <p className="text-sm" style={{ color: 'var(--color-slate)' }}>
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first job application to get started.'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="studio-btn secondary mt-4">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job, i) => (
            <div key={job.id} className="animate-fade-in-up h-full flex flex-col" style={{ animationDelay: `${i * 0.04}s` }}>
              <JobCard 
                job={job} 
                onDelete={handleDeleteJob} 
                onUpdate={(id, data) => {
                  setJobs(prev => prev.map(j => j.id === id ? { ...j, ...data } : j));
                }}
              />
            </div>
          ))}
        </div>
      )}

      <AddJobModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddJob} />
    </div>
  );
}
