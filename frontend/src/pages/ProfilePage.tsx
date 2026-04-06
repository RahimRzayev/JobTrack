import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

/** Strip Django storage hash from filenames like "Rahim_Rzayev_CV_d0x0h7f.pdf" → "Rahim_Rzayev_CV.pdf" */
function cleanFilename(url: string): string {
  const raw = url.split('/').pop() || '';
  // Django appends _HASH before the extension, e.g. name_abc1234.pdf
  return raw.replace(/_[a-zA-Z0-9]{7}(\.\w+)$/, '$1');
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const cvPdfUrl = user?.cv_pdf;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleSaveCV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { toast.error('Select a PDF first.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('cv_pdf', selectedFile);
      const response = await api.patch('/auth/me/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(response.data);
      toast.success('CV uploaded successfully!');
      setSelectedFile(null);
    } catch (error) {
      toast.error('Failed to upload CV');
    } finally { setLoading(false); }
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();

  const [showUploadZone, setShowUploadZone] = useState(false);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

      {/* Page header */}
      <h1 className="text-2xl font-black" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>Profile</h1>

      {/* ─── Profile Header Card ─── */}
      <div className="studio-card overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: 'var(--color-coral)', color: '#fff', fontFamily: 'var(--font-display)' }}
          >
            {initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-slate)' }}>
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2.5 justify-center sm:justify-start">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: 'var(--color-teal-l)', color: 'var(--color-teal)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-teal)' }} />
                Active Account
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: cvPdfUrl ? 'var(--color-teal-l)' : 'var(--color-coral-l)', color: cvPdfUrl ? 'var(--color-teal)' : 'var(--color-coral)' }}
              >
                {cvPdfUrl ? '✓ CV Uploaded' : '✗ No CV'}
              </span>
            </div>
          </div>
        </div>
        {/* Details row */}
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ borderTop: '1px solid var(--color-sand)' }}>
          {[
            { label: 'Full Name', value: `${user?.first_name} ${user?.last_name}` },
            { label: 'Email Address', value: user?.email },
            { label: 'Member Since', value: user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
          ].map((row, i) => (
            <div
              key={row.label}
              className="px-6 py-4"
              style={{ borderRight: i < 2 ? '1px solid var(--color-sand)' : 'none' }}
            >
              <span className="block text-xs font-medium" style={{ color: 'var(--color-slate)' }}>{row.label}</span>
              <span className="block text-sm font-semibold mt-0.5 truncate" style={{ color: 'var(--color-ink)' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Master CV ─── */}
      <div className="studio-card overflow-hidden">
        <form onSubmit={handleSaveCV}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-sand)' }}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>Master CV</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-slate)' }}>
                Your resume powers AI Match Scoring and Cover Letter generation.
              </p>
            </div>
            {selectedFile && (
              <button type="submit" disabled={loading} className="studio-btn primary" style={{ fontSize: 13 }}>
                {loading ? 'Uploading...' : 'Upload CV'}
              </button>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/* Currently stored CV */}
            {cvPdfUrl && !selectedFile && (
              <div
                className="p-4 rounded-lg flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-teal-l)', border: '1px solid rgba(42,157,143,0.15)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-teal)', color: '#fff' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <a
                      href={cvPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold hover:underline"
                      style={{ color: 'var(--color-ink)' }}
                    >
                      {cleanFilename(cvPdfUrl)}
                    </a>
                    <p className="text-xs" style={{ color: 'var(--color-teal)' }}>Currently stored</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowUploadZone(true); }}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: 'var(--color-coral)' }}
                >
                  Replace
                </button>
              </div>
            )}

            {/* Upload zone — shown when no CV, replacing, or file selected */}
            {(!cvPdfUrl || showUploadZone || selectedFile) && (
              <div
                className="py-8 px-6 text-center rounded-lg cursor-pointer transition-all"
                style={{ border: '2px dashed var(--color-sand)', backgroundColor: 'var(--color-cream)' }}
                onClick={() => document.getElementById('cv_pdf_upload')?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-coral)';
                  e.currentTarget.style.backgroundColor = 'var(--color-coral-l)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-sand)';
                  e.currentTarget.style.backgroundColor = 'var(--color-cream)';
                }}
              >
                <svg className="mx-auto w-8 h-8 mb-2" style={{ color: 'var(--color-stone)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-charcoal)' }}>
                  {selectedFile ? 'File selected' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-stone)' }}>PDF only, up to 10 MB</p>
                <input id="cv_pdf_upload" name="cv_pdf" type="file" accept="application/pdf" className="sr-only" onChange={(e) => { handleFileChange(e); setShowUploadZone(false); }} />

                {selectedFile && (
                  <div
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: '#fff', border: '1px solid var(--color-coral)', color: 'var(--color-coral)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="ml-1 hover:opacity-70"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* ─── AI Features Info ─── */}
      <div
        className="studio-card p-6 flex items-start gap-4"
        style={{ backgroundColor: 'var(--color-amber-l)', borderColor: 'rgba(233,168,32,0.2)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
          style={{ backgroundColor: 'rgba(233,168,32,0.15)' }}
        >
          💡
        </div>
        <div>
          <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--color-charcoal)' }}>How AI Features Work</h4>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-slate)' }}>
            Your uploaded CV is securely processed by Vertex AI (Google Gemini) whenever you use <strong>Match Scoring</strong> or <strong>Cover Letter</strong> generation.
            The AI compares your skills and experience against each job description to provide personalized insights and recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
