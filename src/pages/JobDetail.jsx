import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiExternalLink, FiLinkedin, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiUser, FiDollarSign } from 'react-icons/fi';
import { getJob, deleteJob, updateJob } from '../db';
import JobForm from '../components/JobForm';

const statusStyles = {
  Applied:    { bg: 'rgba(52,152,219,0.15)',  color: '#5dade2', border: '1px solid rgba(52,152,219,0.3)' },
  Screening:  { bg: 'rgba(0,206,209,0.15)',   color: '#00ced1', border: '1px solid rgba(0,206,209,0.3)' },
  Interview:  { bg: 'rgba(255,165,2,0.15)',    color: '#ffa502', border: '1px solid rgba(255,165,2,0.3)' },
  Technical:  { bg: 'rgba(255,121,63,0.15)',   color: '#ff793f', border: '1px solid rgba(255,121,63,0.3)' },
  Offer:      { bg: 'rgba(46,213,115,0.15)',   color: '#2ed573', border: '1px solid rgba(46,213,115,0.3)' },
  Accepted:   { bg: 'rgba(0,210,140,0.15)',    color: '#00d28c', border: '1px solid rgba(0,210,140,0.3)' },
  Rejected:   { bg: 'rgba(255,71,87,0.15)',    color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)' },
  Withdrawn:  { bg: 'rgba(156,163,192,0.12)',  color: '#9ca3c0', border: '1px solid rgba(156,163,192,0.3)' },
};

const workTypeCls = {
  'On-site': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Hybrid':  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Remote':  'bg-green-500/10 text-green-400 border-green-500/20',
};

const LinkifiedText = ({ text }) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">{part}</a>;
    }
    return part;
  });
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    (async () => {
      const j = await getJob(Number(id));
      setJob(j || null);
      setLoading(false);
    })();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job entry?')) {
      await deleteJob(Number(id));
      navigate('/');
    }
  };

  const handleSave = async (form) => {
    await updateJob(Number(id), form);
    const updated = await getJob(Number(id));
    setJob(updated);
    setShowEdit(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-14 bg-card border border-border rounded-xl">
        <h2 className="text-fg2 mb-3 text-lg">Job not found</h2>
        <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent border border-accent text-white rounded-lg text-sm font-medium transition-all hover:bg-accent-h">
          ← Back to list
        </Link>
      </div>
    );
  }

  const ss = statusStyles[job.status] || statusStyles.Applied;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent border border-transparent rounded-lg text-fg2 text-sm font-medium cursor-pointer transition-all hover:bg-hover hover:text-fg" onClick={() => navigate('/')}>
          <FiArrowLeft /> Back
        </button>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent border border-accent text-white rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-accent-h hover:-translate-y-0.5 btn-glow" onClick={() => setShowEdit(true)}>
            <FiEdit2 /> Edit
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-danger/10 border border-danger/20 text-danger rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-danger hover:text-white hover:border-danger hover:-translate-y-0.5" onClick={handleDelete}>
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-md transition-colors">
        {/* Top */}
        <div className="flex items-start gap-5 mb-8 max-sm:flex-col max-sm:items-center max-sm:text-center border-b border-border/50 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-500/80 flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-lg shadow-accent/20">
            {(job.company || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight mb-1 text-fg">{job.company || 'Unknown'}</h1>
            <p className="text-base text-fg2 mb-3">{job.role || 'No role specified'}</p>
            <div className="flex gap-2 flex-wrap max-sm:justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm" style={{ backgroundColor: ss.bg, color: ss.color, border: ss.border }}>
                {job.status}
              </span>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${workTypeCls[job.workType] || 'bg-elevated border-border text-fg2'}`}>
                {job.workType || 'N/A'}
              </span>
              {job.rating > 0 && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${job.rating >= 4 ? 'bg-green-500/10 text-green-500 border-green-500/20' : job.rating >= 3 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  ★ {job.rating}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: <FiDollarSign />, label: 'Package', value: job.package ? `${job.package} LPA` : null },
            { icon: <FiUser />, label: 'HR', value: job.hr },
            { icon: <FiMapPin />, label: 'Location', value: job.place },
            { icon: <FiCalendar />, label: 'Date Applied', value: job.date },
            { icon: <FiPhone />, label: 'HR Contact', value: job.hrContact },
            { icon: <FiBriefcase />, label: 'Founder', value: job.founderName },
          ].map((item) => (
             <div key={item.label} className="flex flex-col gap-1 p-3 rounded-lg hover:bg-hover/30 transition-colors">
               <div className="flex items-center gap-2 text-muted mb-1">
                 <span className="text-accent text-sm">{item.icon}</span>
                 <span className="text-[0.65rem] font-bold uppercase tracking-wider">{item.label}</span>
               </div>
               <span className="text-sm text-fg font-medium truncate">{item.value || '—'}</span>
             </div>
          ))}
        </div>

        {/* Links */}
        {(job.siteLink || job.linkedinLink) && (
          <div className="flex gap-3 mb-8 flex-wrap pt-4 border-t border-border/50">
            {job.siteLink && (
              <a href={job.siteLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-elevated border border-border rounded-lg text-fg2 text-sm font-medium transition-all hover:bg-hover hover:text-accent hover:border-accent hover:-translate-y-0.5 no-underline shadow-sm">
                <FiExternalLink /> Website
              </a>
            )}
            {job.linkedinLink && (
              <a href={job.linkedinLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-elevated border border-border rounded-lg text-fg2 text-sm font-medium transition-all hover:bg-hover hover:text-[#0077b5] hover:border-[#0077b5] hover:-translate-y-0.5 no-underline shadow-sm">
                <FiLinkedin /> LinkedIn
              </a>
            )}
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div className="bg-surface-alt/50 rounded-xl p-5 border border-border">
            <h3 className="text-[0.7rem] font-bold text-muted uppercase tracking-wider mb-3">Notes</h3>
            <p className="text-sm text-fg2 leading-relaxed whitespace-pre-wrap"><LinkifiedText text={job.description} /></p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <JobForm job={job} onSave={handleSave} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}
