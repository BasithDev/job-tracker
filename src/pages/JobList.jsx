import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { FiSearch, FiChevronUp, FiChevronDown, FiColumns, FiChevronLeft, FiChevronRight, FiTrash2, FiDownload, FiUpload, FiPlus } from 'react-icons/fi';
import { db, deleteJob, addJob, updateJob, getAllPlaces, savePlace } from '../db';
import JobForm from '../components/JobForm';
import { BiArrowBack } from 'react-icons/bi';

const ALL_COLUMNS = [
  { key: 'company', label: 'Company' },
  { key: 'role', label: 'Role' },
  { key: 'package', label: 'Package (LPA)' },
  { key: 'hr', label: 'HR' },
  { key: 'workType', label: 'Work Type' },
  { key: 'place', label: 'Place' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'rating', label: 'Rating' },
  { key: 'hrContact', label: 'HR Contact' },
  { key: 'siteLink', label: 'Site Link' },
  { key: 'linkedinLink', label: 'LinkedIn' },
  { key: 'founderName', label: 'Founder' },
  { key: 'description', label: 'Description' },
];

const DEFAULT_VISIBLE_COLS = ['company', 'role', 'package', 'hr', 'workType', 'place', 'date', 'status', 'rating'];

const WORK_TYPES = ['All', 'On-site', 'Hybrid', 'Remote'];
const STATUSES = ['All', 'Applied', 'Screening', 'Interview', 'Technical', 'Offer', 'Accepted', 'Rejected', 'Withdrawn'];
const PAGE_SIZES = [10, 25, 50];

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

export default function JobList() {
  const navigate = useNavigate();
  const jobs = useLiveQuery(() => db.jobs.toArray()) || [];
  const places = useLiveQuery(() => getAllPlaces()) || [];

  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [filterWorkType, setFilterWorkType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPlace, setFilterPlace] = useState('All');
  const [filterMinPackage, setFilterMinPackage] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE_COLS);
  const [showColPicker, setShowColPicker] = useState(false);

  const processed = useMemo(() => {
    let data = [...jobs];

    // Filters
    if (filterWorkType !== 'All') data = data.filter((j) => j.workType === filterWorkType);
    if (filterStatus !== 'All') data = data.filter((j) => j.status === filterStatus);
    if (filterPlace !== 'All') data = data.filter((j) => (j.place || '').toLowerCase() === filterPlace.toLowerCase());
    if (filterMinPackage) {
      const minPkg = Number(filterMinPackage);
      if (!isNaN(minPkg)) {
        data = data.filter((j) => {
          const p = Number(j.package);
          return !isNaN(p) && p >= minPkg;
        });
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((j) =>
        ALL_COLUMNS.some((col) => String(j[col.key] || '').toLowerCase().includes(q))
      );
    }

    // Sort
    data.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];

      // Numeric sort for package and rating
      if (sortKey === 'package' || sortKey === 'rating') {
        // Use parseFloat to handle "12 LPA" -> 12, or just 12 -> 12
        const aNum = parseFloat(av) || 0;
        const bNum = parseFloat(bv) || 0;
        return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String sort
      av = String(av || '').toLowerCase();
      bv = String(bv || '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [jobs, search, sortKey, sortDir, filterWorkType, filterStatus, filterPlace, filterMinPackage]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paged = processed.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = useCallback((key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  const toggleCol = (key) => {
    setVisibleCols((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleSave = async (form) => {
    if (editJob) {
      await updateJob(editJob.id, form);
    } else {
      await addJob(form);
    }
    setShowForm(false);
    setEditJob(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this job entry?')) {
      await deleteJob(id);
    }
  };

  const handleInlineStatus = async (e, id) => {
    e.stopPropagation();
    await updateJob(id, { status: e.target.value });
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  /* ---- Export / Import ---- */
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const headers = ALL_COLUMNS.map(col => col.label);
    const keys = ALL_COLUMNS.map(col => col.key);

    const csvContent = [
      headers.join(','),
      ...jobs.map(job => keys.map(key => {
        let val = job[key];
        if (val === undefined || val === null) val = '';
        const str = String(val).replace(/"/g, '""');
        return /[",\n]/.test(str) ? `"${str}"` : str;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `jobs_backup_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      if (!text) return;
      
      // Full Text CSV Parser (Handles Multiline)
      const rows = [];
      let currentRow = [];
      let currentField = '';
      let inQuote = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
          if (inQuote && nextChar === '"') {
             currentField += '"';
             i++; // Skip next quote
          } else {
             inQuote = !inQuote;
          }
        } else if (char === ',' && !inQuote) {
          currentRow.push(currentField);
          currentField = '';
        } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuote) {
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
          if (char === '\r') i++; // Skip \n
        } else {
          currentField += char;
        }
      }
      // Push last row if exists
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
      }

      if (rows.length < 2) return;

      // Headers are first row
      const headers = rows[0].map(h => h.trim());
      
      const keyMap = {};
      ALL_COLUMNS.forEach(col => {
        const idx = headers.findIndex(h => h.toLowerCase() === col.label.toLowerCase());
        if (idx !== -1) keyMap[col.key] = idx;
      });

      let addedCount = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue; // Skip empty rows

        const newJob = {};
        Object.keys(keyMap).forEach(k => {
          const val = row[keyMap[k]];
          newJob[k] = val ? val.trim() : ''; 
        });

        if (Object.keys(newJob).length > 0) {
           // Default status if missing
           if (!newJob.status) newJob.status = 'Applied';
           // Default date if missing
           if (!newJob.date) newJob.date = new Date().toISOString().slice(0, 10);
           
           await addJob(newJob);
           addedCount++;
        }
      }

      alert(`Imported ${addedCount} jobs successfully!`);
      e.target.value = null; 
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      await db.jobs.clear();
      await db.places.clear();
      alert('All data cleared successfully.');
      // Reset filters that might depend on data
      setFilterPlace('All');
      setPage(0);
    }
  };

  const columns = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key));
  const selectCls = 'px-3 py-2 bg-input border border-border rounded-lg text-fg text-sm cursor-pointer transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] min-w-[100px]';

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full pl-9 pr-3 py-2 bg-input border border-border rounded-lg text-fg text-sm transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] placeholder:text-muted"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted tracking-wider">Sort by:</span>
              <select
                className="px-3 py-2 bg-input border border-border rounded-lg text-fg text-sm cursor-pointer transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] min-w-[160px]"
                value={`${sortKey}-${sortDir}`}
                onChange={(e) => {
                  const [key, dir] = e.target.value.split('-');
                  setSortKey(key);
                  setSortDir(dir);
                }}
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="package-desc">Package (High → Low)</option>
                <option value="package-asc">Package (Low → High)</option>
                <option value="rating-desc">Rating (High → Low)</option>
                <option value="rating-asc">Rating (Low → High)</option>
              </select>
            </div>

            <div className="relative">
              <button
                className="inline-flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg text-fg2 text-sm font-medium cursor-pointer transition-all hover:bg-hover hover:text-fg"
                onClick={() => setShowColPicker((p) => !p)}
              >
                <FiColumns /> Columns
              </button>
              {showColPicker && (
                <div className="absolute top-[calc(100%+4px)] left-0 bg-card border border-border rounded-lg p-2.5 min-w-[170px] shadow-xl z-50 animate-drop-in">
                  <div className="max-h-[300px] overflow-y-auto">
                    {ALL_COLUMNS.map((c) => (
                      <label key={c.key} className="flex items-center gap-2 px-2 py-1 text-fg2 text-sm cursor-pointer rounded-md transition-all hover:text-fg hover:bg-hover">
                        <input type="checkbox" checked={visibleCols.includes(c.key)} onChange={() => toggleCol(c.key)} className="w-3.5 h-3.5 accent-accent" />
                        {c.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              {processed.length} jobs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium cursor-pointer transition-all hover:bg-red-500/20 hover:text-red-600"
              title="Clear All Data"
            >
              <FiTrash2 />
              <span className="hidden sm:inline">Clear All</span>
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-fg2 text-sm font-medium cursor-pointer transition-all hover:bg-hover hover:text-fg"
              title="Export to CSV"
            >
              <FiDownload />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-fg2 text-sm font-medium cursor-pointer transition-all hover:bg-hover hover:text-fg"
              title="Import from CSV"
            >
              <FiUpload />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-accent border border-accent text-white rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-accent-h shadow-sm"
            >
              <FiPlus className="text-lg" />
              <span className="hidden sm:inline">Add Job</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-border/40">
           <span className="text-xs font-semibold uppercase text-muted tracking-wider mr-1">Filter by:</span>
          
           <select className={selectCls} value={filterWorkType} onChange={handleFilterChange(setFilterWorkType)}>
            {WORK_TYPES.map((t) => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>

          <select className={selectCls} value={filterStatus} onChange={handleFilterChange(setFilterStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
          </select>

          <select className={selectCls} value={filterPlace} onChange={handleFilterChange(setFilterPlace)}>
            <option value="All">All Places</option>
            {places.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>

          <input
            type="number"
            placeholder="Min Package (LPA)"
            value={filterMinPackage}
            onChange={handleFilterChange(setFilterMinPackage)}
            className={`${selectCls} w-[140px] cursor-text placeholder:text-muted`}
          />

          {(filterWorkType !== 'All' || filterStatus !== 'All' || filterPlace !== 'All' || filterMinPackage) && (
             <button 
               onClick={() => {
                 setFilterWorkType('All');
                 setFilterStatus('All');
                 setFilterPlace('All');
                 setFilterMinPackage('');
                 setPage(0);
               }}
               className="text-xs text-danger hover:underline ml-auto"
             >
               Clear filters
             </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-elevated border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-[0.7rem] font-bold uppercase tracking-wider text-muted whitespace-nowrap select-none"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="w-12 px-2 py-3 border-b border-border"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-16 px-4">
                    <div className="flex flex-col items-center gap-3 text-muted">
                      <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center text-2xl">📋</div>
                      <p className="text-sm font-medium">No jobs found matching filters</p>
                      <button
                        className="inline-flex items-center gap-1 px-4 py-2 bg-accent border border-accent text-white rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-accent-h btn-glow"
                        onClick={() => setShowForm(true)}
                      >
                        Add New Job
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paged.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => navigate(`/job/${job.id}`)}
                  className="cursor-pointer transition-colors hover:bg-hover group"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-fg2 group-hover:text-fg transition-colors whitespace-nowrap">
                      {col.key === 'status' ? (
                        <select
                          value={job.status}
                          onChange={(e) => handleInlineStatus(e, job.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="status-inline-select font-medium text-xs px-2.5 py-1 rounded-full border shadow-sm outline-none cursor-pointer"
                          style={{
                            backgroundColor: (statusStyles[job.status] || statusStyles.Applied).bg,
                            color: (statusStyles[job.status] || statusStyles.Applied).color,
                            borderColor: (statusStyles[job.status] || statusStyles.Applied).border,
                          }}
                        >
                          {STATUSES.filter(s => s !== 'All').map((s) => (
                            <option key={s} value={s} className="bg-card text-fg">{s}</option>
                          ))}
                        </select>
                      ) : col.key === 'workType' ? (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${workTypeCls[job.workType] || 'bg-elevated border-border text-fg2'}`}>
                          {job.workType}
                        </span>
                      ) : col.key === 'rating' ? (
                         job.rating ? (
                          <div className="flex items-center">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${job.rating >= 4 ? 'bg-green-500/10 text-green-500' : job.rating >= 3 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                              {job.rating}
                            </span>
                          </div>
                         ) : <span className="text-muted text-xs">—</span>
                      ) : col.key === 'package' ? (
                        job.package ? <span className="font-semibold text-fg">{job.package} <span className="text-xs text-muted font-normal">LPA</span></span> : <span className="text-muted">—</span>
                      ) : col.key === 'date' ? (
                        <span className="text-xs tabular-nums text-muted group-hover:text-fg2">{job.date || '—'}</span>
                      ) : (
                        <span className="truncate max-w-[180px] block" title={job[col.key]}>{job[col.key] || '—'}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-muted transition-all cursor-pointer border-none text-sm hover:bg-danger/10 hover:text-danger opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleDelete(e, job.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-alt/50">
           <div className="flex items-center gap-3">
             <span className="text-xs text-muted">Rows per page:</span>
             <select 
               className="bg-transparent border-none text-xs font-medium text-fg cursor-pointer focus:outline-none"
               value={pageSize}
               onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
             >
               {PAGE_SIZES.map(s => <option key={s} value={s} className="bg-card">{s}</option>)}
             </select>
           </div>
           
           <div className="flex items-center gap-4">
             <span className="text-xs text-muted">
               {processed.length > 0 ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, processed.length)} of ${processed.length}` : '0 of 0'}
             </span>
             <div className="flex gap-1">
               <button
                 className="p-1 rounded hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                 disabled={page === 0}
                 onClick={() => setPage(p => p - 1)}
               >
                 <FiChevronLeft className="text-lg" />
               </button>
               <button
                 className="p-1 rounded hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                 disabled={page >= totalPages - 1}
                 onClick={() => setPage(p => p + 1)}
               >
                 <FiChevronRight className="text-lg" />
               </button>
             </div>
           </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <JobForm
          job={editJob}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditJob(null); }}
        />
      )}
    </div>
  );
}
