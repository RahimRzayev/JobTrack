import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { JobApplication } from '../types';
import { jobsApi } from '../services/jobsApi';
import JobCard from '../components/JobCard';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'wishlist', title: 'Wishlist', accent: 'var(--color-slate)', bg: 'var(--color-cream-d)' },
  { id: 'applied', title: 'Applied', accent: 'var(--color-navy)', bg: '#f5f8fb' },
  { id: 'interviewing', title: 'Interviewing', accent: 'var(--color-violet)', bg: '#f8f5fd' },
  { id: 'offer', title: 'Offer', accent: 'var(--color-teal)', bg: '#f2faf8' },
  { id: 'rejected', title: 'Rejected', accent: 'var(--color-coral)', bg: '#fdf5f3' },
];

export default function KanbanPage() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [jobToSchedule, setJobToSchedule] = useState<JobApplication | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getAll();
      setJobs(data);
    } catch (error) {
      toast.error('Failed to load job applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await jobsApi.delete(id);
      setJobs(jobs.filter(job => job.id !== id));
      toast.success('Deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const destColumnId = destination.droppableId;
    const draggedJobId = parseInt(draggableId, 10);

    if (source.droppableId !== destColumnId) {
      const previousJobs = [...jobs];
      const newJobs = jobs.map(job =>
        job.id === draggedJobId
          ? { ...job, status: destColumnId as any, status_display: COLUMNS.find(c => c.id === destColumnId)?.title || '' }
          : job
      );
      setJobs(newJobs);

      try {
        await jobsApi.update(draggedJobId, { status: destColumnId as any });
        toast.success(`Moved to ${COLUMNS.find(c => c.id === destColumnId)?.title}`);
        if (destColumnId === 'interviewing') {
          setJobToSchedule(newJobs.find(j => j.id === draggedJobId) as JobApplication);
          setIsScheduleModalOpen(true);
        }
      } catch (error) {
        setJobs(previousJobs);
        toast.error('Failed to update status');
      }
    }
  };

  const handleJobScheduled = (id: number, data: Partial<JobApplication>) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, ...data } : job));
  };

  const getJobsByStatus = (status: string) => jobs.filter(job => job.status === status);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--color-coral)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 mb-[100px] max-w-full overflow-x-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>Kanban Board</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-slate)' }}>
          Drag and drop applications to update their status.
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-8 hide-scrollbar snap-x">
          {COLUMNS.map((col) => {
            const columnJobs = getJobsByStatus(col.id);
            return (
              <div key={col.id} className="flex-shrink-0 w-80 snap-center rounded-xl overflow-hidden" style={{ backgroundColor: col.bg, border: '1px solid var(--color-sand)' }}>
                {/* Header */}
                <div className="p-3 flex justify-between items-center" style={{ borderBottom: `2px solid ${col.accent}` }}>
                  <h3 className="text-sm font-bold" style={{ color: col.accent }}>{col.title}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: '#fff', color: 'var(--color-slate)' }}>
                    {columnJobs.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="px-3 py-3 min-h-[500px] transition-colors"
                      style={{ backgroundColor: snapshot.isDraggingOver ? 'rgba(232,99,74,0.04)' : 'transparent' }}
                    >
                      {columnJobs.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3"
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.9 : 1,
                              }}
                            >
                              <JobCard
                                  job={job}
                                  compact
                                  onDelete={handleDeleteJob}
                                  onUpdate={(id, data) => {
                                    setJobs(jobs.map(j => j.id === id ? { ...j, ...data } : j));
                                  }}
                                />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {columnJobs.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg text-sm" style={{ borderColor: 'var(--color-sand)', color: 'var(--color-stone)' }}>
                          Drop a job here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        job={jobToSchedule}
        onScheduled={handleJobScheduled}
      />
    </div>
  );
}
