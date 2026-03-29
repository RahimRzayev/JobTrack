import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { JobApplication } from '../types';
import { jobsApi } from '../services/jobsApi';
import JobCard from '../components/JobCard';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'wishlist', title: 'Wishlist', color: 'bg-gray-100' },
  { id: 'applied', title: 'Applied', color: 'bg-blue-100' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-purple-100' },
  { id: 'offer', title: 'Offer', color: 'bg-green-100' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-100' },
];

export default function KanbanPage() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interview scheduling modal state
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

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    
    try {
      await jobsApi.delete(id);
      setJobs(jobs.filter(job => job.id !== id));
      toast.success('Job application deleted');
    } catch (error) {
      toast.error('Failed to delete job application');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColumnId = source.droppableId;
    const destColumnId = destination.droppableId;
    
    // Find job being moved
    const draggedJobId = parseInt(draggableId, 10);
    const draggedJob = jobs.find(job => job.id === draggedJobId);
    
    if (!draggedJob) return;

    if (sourceColumnId !== destColumnId) {
      // Optimistic update
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
        
        // If moved to interviewing, prompt to schedule
        if (destColumnId === 'interviewing') {
          setJobToSchedule(newJobs.find(j => j.id === draggedJobId) as JobApplication);
          setIsScheduleModalOpen(true);
        }
      } catch (error) {
        // Rollback
        setJobs(previousJobs);
        toast.error('Failed to update job status');
      }
    }
  };

  const handleJobScheduled = (id: number, data: Partial<JobApplication>) => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, ...data } : job
    ));
  };

  // Group jobs by status
  const getJobsByStatus = (status: string) => {
    return jobs.filter(job => job.status === status);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 mb-[100px] max-w-full overflow-x-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">
          Kanban Board
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Drag and drop applications to update their status.
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
          {COLUMNS.map((col) => {
            const columnJobs = getJobsByStatus(col.id);
            return (
              <div 
                key={col.id} 
                className={`flex-shrink-0 w-80 rounded-lg pb-4 snap-center ${col.color} border border-gray-200 bg-opacity-50`}
              >
                <div className="p-3 border-b border-gray-200 bg-white bg-opacity-40 rounded-t-lg flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">{col.title}</h3>
                  <span className="bg-white text-xs font-bold px-2 py-1 rounded-full text-gray-600 border border-gray-200">
                    {columnJobs.length}
                  </span>
                </div>
                
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`px-3 min-h-[500px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-indigo-50 bg-opacity-50 rounded-lg' : ''
                      }`}
                    >
                      {columnJobs.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-3 transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg rotate-2 z-50' : ''
                              }`}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.9 : 1,
                              }}
                            >
                              <JobCard 
                                job={job} 
                                onDelete={handleDeleteJob}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {columnJobs.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
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
