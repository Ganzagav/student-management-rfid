import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, todayAttendance: 0 });

  // New Student Form State
  const [formData, setFormData] = useState({
    rfid_tag: '',
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    department: '',
  });
  const [formMsg, setFormMsg] = useState(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      const [resStu, resAtt, resStats] = await Promise.all([
        fetch(`${API_BASE}/students`),
        fetch(`${API_BASE}/attendance`),
        fetch(`${API_BASE}/stats`),
      ]);

      if (resStu.ok) setStudents(await resStu.json());
      if (resAtt.ok) setAttendance(await resAtt.json());
      if (resStats.ok) setStats(await resStats.json());
    } catch (err) {
      console.error('Error connecting to backend:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh logs every 3 seconds to catch real-time scans
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setFormMsg({ type: 'success', text: `Student ${data.first_name} registered successfully!` });
        setFormData({ rfid_tag: '', student_id: '', first_name: '', last_name: '', email: '', department: '' });
        fetchData();
      } else {
        setFormMsg({ type: 'error', text: data.error || 'Registration failed' });
      }
    } catch (err) {
      setFormMsg({ type: 'error', text: 'Server communication error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-slate-800/80 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Student Attendance Management System
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time RFID Tracking Dashboard</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-400">LIVE SCANNER READY</span>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-xl">
            <p className="text-slate-400 text-sm">Total Registered Students</p>
            <p className="text-3xl font-extrabold mt-1 text-indigo-400">{stats.totalStudents}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-xl">
            <p className="text-slate-400 text-sm">Today's Attendance Count</p>
            <p className="text-3xl font-extrabold mt-1 text-emerald-400">{stats.todayAttendance}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 gap-4">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 px-2 font-medium text-sm transition-colors ${
              activeTab === 'attendance'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Attendance Logs ({attendance.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 px-2 font-medium text-sm transition-colors ${
              activeTab === 'students'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Student Directory ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-3 px-2 font-medium text-sm transition-colors ${
              activeTab === 'register'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + Register Student
          </button>
        </div>

        {/* Tab 1: Attendance Logs */}
        {activeTab === 'attendance' && (
          <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-4">Time</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">RFID Tag</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500">
                      No attendance scans recorded yet. Use the simulator to tap a card!
                    </td>
                  </tr>
                ) : (
                  attendance.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-400">
                        {new Date(log.scanned_at).toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-slate-200">{log.student_id}</td>
                      <td className="p-4">{log.first_name} {log.last_name}</td>
                      <td className="p-4">{log.department}</td>
                      <td className="p-4 font-mono text-xs text-indigo-300">{log.rfid_tag}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Student Directory */}
        {activeTab === 'students' && (
          <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">RFID Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="p-4 font-semibold text-slate-200">{stu.student_id}</td>
                    <td className="p-4">{stu.first_name} {stu.last_name}</td>
                    <td className="p-4 text-slate-400">{stu.email}</td>
                    <td className="p-4">{stu.department}</td>
                    <td className="p-4 font-mono text-xs text-indigo-300">{stu.rfid_tag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Register Student Form */}
        {activeTab === 'register' && (
          <div className="max-w-xl bg-slate-800/60 p-6 rounded-xl border border-slate-700/50">
            <h2 className="text-lg font-semibold mb-4 text-slate-100">Register New Student</h2>

            {formMsg && (
              <div
                className={`p-3 rounded-lg mb-4 text-sm ${
                  formMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU004"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">RFID Tag ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TAG_1004"
                    value={formData.rfid_tag}
                    onChange={(e) => setFormData({ ...formData, rfid_tag: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-indigo-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-2"
              >
                Save Student & Link RFID Tag
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}