import { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';

const WORK_TYPES = ['On-site', 'Hybrid', 'Remote'];
const STATUSES = ['Applied', 'Screening', 'Interview', 'Technical', 'Offer', 'Accepted', 'Rejected', 'Withdrawn'];

const emptyForm = {
  company: '',
  role: '',
  package: '',
  hr: '',
  workType: 'On-site',
  place: '',
  date: new Date().toISOString().split('T')[0],
  status: 'Applied',
  hrContact: '',
  siteLink: '',
  linkedinLink: '',
  founderName: '',
  description: '',
  rating: '',
};

export default function JobForm({ job, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (job) setForm({ ...emptyForm, ...job });
    else setForm(emptyForm);
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert package and rating to numbers for storage
    const out = {
      ...form,
      package: form.package === '' ? '' : String(form.package),
      rating: form.rating === '' ? 0 : Number(form.rating),
    };
    onSave(out);
  };

  const inputCls = 'w-full px-3 py-2 bg-input border border-border rounded-lg text-fg text-sm transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] placeholder:text-muted';
  const labelCls = 'text-[0.7rem] font-semibold uppercase tracking-wider text-muted';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] animate-fade-in p-4" onClick={onClose}>
      <div className="bg-surface-alt border border-border rounded-xl w-full max-w-[660px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-fg">{job ? 'Edit Job' : 'Add New Job'}</h2>
          <button className="flex items-center justify-center w-8 h-8 rounded-md text-fg2 hover:bg-hover hover:text-fg transition-all cursor-pointer border-none bg-transparent" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Company *</label>
              <input name="company" value={form.company} onChange={handleChange} required placeholder="e.g. Google" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Role *</label>
              <input name="role" value={form.role} onChange={handleChange} required placeholder="e.g. Frontend Developer" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Package (LPA)</label>
              <input
                name="package"
                type="number"
                step="any"
                min="0"
                value={form.package}
                onChange={handleChange}
                placeholder="e.g. 12"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>HR Name</label>
              <input name="hr" value={form.hr} onChange={handleChange} placeholder="e.g. Jane Doe" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Work Type</label>
              <select name="workType" value={form.workType} onChange={handleChange} className={inputCls}>
                {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Place</label>
              <input name="place" value={form.place} onChange={handleChange} placeholder="e.g. Bangalore" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Date Applied</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>HR Contact</label>
              <input name="hrContact" value={form.hrContact} onChange={handleChange} placeholder="e.g. +91 9876543210" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Site Link</label>
              <input name="siteLink" value={form.siteLink} onChange={handleChange} placeholder="https://..." className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>LinkedIn Link</label>
              <input name="linkedinLink" value={form.linkedinLink} onChange={handleChange} placeholder="https://linkedin.com/..." className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Founder Name</label>
              <input name="founderName" value={form.founderName} onChange={handleChange} placeholder="e.g. Sundar Pichai" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Notes about this application..." className={`${inputCls} resize-y min-h-16`} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Rating (out of 5)</label>
              <input
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={handleChange}
                placeholder="e.g. 4.5"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-border">
            <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 bg-transparent border border-transparent rounded-lg text-fg text-sm font-medium cursor-pointer transition-all hover:bg-hover" onClick={onClose}>Cancel</button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent border border-accent text-white rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-accent-h hover:-translate-y-0.5 btn-glow">
              <FiSave /> {job ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
