import { useState } from 'react';
import { JobApplication } from '../types';
import MatchScoreModal from './MatchScoreModal';
import CoverLetterModal from './CoverLetterModal';
import ScheduleInterviewModal from './ScheduleInterviewModal';

interface JobCardProps {
  job: JobApplication;
  onUpdate?: (id: number, data: Partial<JobApplication>) => void;
  onDelete?: (id: number) => void;
  compact?: boolean; // Kanban mode: fixed-height sections
}

export default function JobCard({ job, onUpdate, onDelete, compact = false }: JobCardProps) {
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const getScoreClass = (score: number) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const statusStyles: Record<string, { bg: string; color: string }> = {
    wishlist:      { bg: 'var(--color-cream-d)', color: 'var(--color-slate)' },
    applied:       { bg: '#eef3f8',              color: 'var(--color-navy)' },
    interviewing:  { bg: 'var(--color-violet-l)', color: 'var(--color-violet)' },
    offer:         { bg: 'var(--color-teal-l)',   color: 'var(--color-teal)' },
    rejected:      { bg: 'var(--color-coral-l)',  color: 'var(--color-coral)' },
  };

  const s = statusStyles[job.status] || statusStyles.wishlist;

  return (
    <>
      <div className={`studio-card flex flex-col ${compact ? 'p-3.5' : 'p-5 h-full'}`} style={compact ? { minHeight: '100px' } : undefined}>
        {/* Header — fixed layout: title + company left, badges right */}
        <div className="flex justify-between items-start gap-3" style={{ minHeight: compact ? undefined : undefined }}>
          <div className="min-w-0 flex-1">
            <h3 className={`font-bold leading-snug truncate ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--color-ink)' }} title={job.position}>
              {job.position}
            </h3>
            <p className="text-xs font-medium mt-0.5 truncate" style={{ color: 'var(--color-coral)' }}>
              {job.company}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {!compact && (
              <span className="studio-badge capitalize" style={{ backgroundColor: s.bg, color: s.color }}>
                {job.status_display || job.status}
              </span>
            )}
            {job.match_score !== null && (
              <span className={`score-badge ${getScoreClass(job.match_score)}`}>
                {job.match_score}%{!compact && ' Match'}
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div
          className={`space-y-1 overflow-hidden ${compact ? 'mt-1.5' : 'mt-2 flex-1'}`}
        >
          {job.location && (
            <div className="flex items-center gap-1.5 text-xs truncate" style={{ color: 'var(--color-slate)' }}>
              <svg className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-stone)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{job.location}</span>
            </div>
          )}
          {!compact && job.deadline && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-slate)' }}>
              <svg className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-stone)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(job.deadline).toLocaleDateString()}</span>
            </div>
          )}
          {(job.interview_datetime || (!compact ? job.status === 'interviewing' : false)) && (
            <button 
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-1.5 text-xs hover:underline text-left" 
              style={{ color: 'var(--color-violet)' }}
            >
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {job.interview_datetime 
                  ? new Date(job.interview_datetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                  : 'Add interview date'}
              </span>
            </button>
          )}
        </div>

        {/* Actions — hidden in compact/Kanban mode */}
        {!compact && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-sand)' }}>
            <div className="flex gap-2">
              <button onClick={() => setIsMatchModalOpen(true)} className="studio-btn primary flex-1" style={{ fontSize: '11px', padding: '6px 8px' }}>
                Scan Match
              </button>
              <button onClick={() => setIsCoverModalOpen(true)} className="studio-btn secondary flex-1" style={{ fontSize: '11px', padding: '6px 8px' }}>
                Cover Letter
              </button>
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <div>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium hover:underline" style={{ color: 'var(--color-teal)' }}>
                    View Posting ↗
                  </a>
                )}
              </div>
              <div>
                {onDelete && (
                  <button onClick={() => onDelete(job.id)}
                    className="text-xs font-medium hover:underline transition-colors"
                    style={{ color: 'var(--color-stone)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-coral)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone)'; }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        job={job}
        onScheduled={(id, data) => {
          if (onUpdate) onUpdate(id, data);
          setIsScheduleModalOpen(false);
        }}
      />
    </>
  );
}
