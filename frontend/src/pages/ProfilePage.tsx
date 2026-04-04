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

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">

      {/* ─── Profile Header Card ─── */}
      <div className="studio-card p-8 flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ backgroundColor: 'var(--color-coral)', color: '#fff', fontFamily: 'var(--font-display)' }}
        >
          {initials}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
            {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-slate)' }}>
            {user?.email}
          </p>
          <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: 'var(--color-teal-l)', color: 'var(--color-teal)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-teal)' }} />
              Active Account
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: cvPdfUrl ? 'var(--color-teal-l)' : 'var(--color-coral-l)', color: cvPdfUrl ? 'var(--color-teal)' : 'var(--color-coral)' }}
            >
              {cvPdfUrl ? '✓ CV Uploaded' : '✗ No CV'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Account Details ─── */}
      <div className="studio-card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-sand)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>Account Details</h3>
        </div>
        <div>
          {[
            { icon: '👤', label: 'Full Name', value: `${user?.first_name} ${user?.last_name}` },
            { icon: '✉️', label: 'Email Address', value: user?.email },
            { icon: '📅', label: 'Member Since', value: user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className="flex items-center px-6 py-4 gap-4"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-sand)' : 'none' }}
            >
              <span className="text-lg">{row.icon}</span>
              <div className="flex-1">
                <span className="block text-xs font-medium" style={{ color: 'var(--color-slate)' }}>{row.label}</span>
                <span className="block text-sm font-medium mt-0.5" style={{ color: 'var(--color-ink)' }}>{row.value}</span>
              </div>
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
            <button type="submit" disabled={loading || !selectedFile} className="studio-btn primary" style={{ fontSize: 13 }}>
              {loading ? 'Uploading...' : 'Upload CV'}
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Currently stored CV */}
            {cvPdfUrl && !selectedFile && (
              <div
                className="p-4 rounded-xl flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-teal-l)', border: '1px solid rgba(42,157,143,0.15)' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-teal)', color: '#fff' }}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--color-teal)' }}>
                      Currently Stored
                    </h4>
                    <a
                      href={cvPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                      style={{ color: 'var(--color-charcoal)' }}
                    >
                      {cleanFilename(cvPdfUrl)}
                    </a>
                  </div>
                </div>
                <label htmlFor="cv_pdf_upload" className="studio-btn ghost cursor-pointer" style={{ fontSize: 13 }}>
                  Replace
                </label>
              </div>
            )}

            {/* Upload zone */}
            <div
              className="py-12 px-6 text-center rounded-xl cursor-pointer transition-all"
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
              <div
                className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-cream-d)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--color-slate)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-charcoal)' }}>
                {selectedFile ? 'File selected' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-stone)' }}>PDF only, up to 10 MB</p>
              <input id="cv_pdf_upload" name="cv_pdf" type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />

              {selectedFile && (
                <div
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: '#fff', border: '1px solid var(--color-coral)', color: 'var(--color-coral)' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="ml-1 hover:opacity-70"
                    style={{ color: 'var(--color-coral)' }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
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
