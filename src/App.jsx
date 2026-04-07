import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import Navbar from './components/Navbar';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import JobForm from './components/JobForm';
import { addJob } from './db';

export default function App() {
  const [showAdd, setShowAdd] = useState(false);

  const handleSave = async (form) => {
    await addJob(form);
    setShowAdd(false);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar onAddClick={() => setShowAdd(true)} />
          <main className="flex-1 px-5 py-5 max-w-[1440px] w-full mx-auto sm:px-8">
            <Routes>
              <Route path="/" element={<JobList />} />
              <Route path="/job/:id" element={<JobDetail />} />
            </Routes>
          </main>

          {showAdd && (
            <JobForm job={null} onSave={handleSave} onClose={() => setShowAdd(false)} />
          )}
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
