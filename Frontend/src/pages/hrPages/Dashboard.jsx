import React, { useState } from "react";
import SideBar from "../../components/SideBar";
import { FaArrowUp, FaUsers, FaBriefcase, FaUserCheck, FaClock, FaCheckCircle, FaChevronDown } from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("February");

  const dataStore = {
    "January": { total: 1100, apps: 70, jobs: 15, hires: 18, time: 38, success: 65 },
    "February": { total: 1247, apps: 84, jobs: 23, hires: 24, time: 32, success: 78 },
    "March": { total: 1400, apps: 110, jobs: 30, hires: 35, time: 28, success: 85 }
  };

  const current = dataStore[selectedMonth];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-slate-900">
      <SideBar />

      <main className="flex-1 ml-[227px] p-6 space-y-5"> {/* Reduced padding & spacing */}
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        
        {/* 1. TOP ROW: SMALLER GRADIENT CARDS */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Total Candidates" val={current.total} trend="+8.2%" color="bg-[#3B82F6]" />
          <StatCard label="Applications" val={current.apps} trend="+12.5%" color="bg-[#4ECDC4]" />
          <StatCard label="Job Positions" val={current.jobs} trend="+2%" color="bg-[#A855F7]" />
          <StatCard label="Hires" val={current.hires} trend="+15%" color="bg-[#818CF8]" />
        </div>

        {/* 2. MIDDLE ROW: BALANCED CHARTS */}
        <div className="grid grid-cols-5 gap-5">
          {/* Funnel Block (3/5 width) */}
          <div className="col-span-3 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-800">Recent Applications</h3>
              <p className="text-slate-400 text-[10px]">Current status overview</p>
            </div>
            
            <div className="space-y-3.5">
              <FunnelRow label="Application" count={842} width="100%" color="bg-blue-800" />
              <FunnelRow label="Screening" count={524} width="70%" color="bg-blue-600" />
              <FunnelRow label="Interview" count={312} width="50%" color="bg-blue-400" />
              <FunnelRow label="Assessment" count={280} width="40%" color="bg-blue-300" />
              <FunnelRow label="References" count={120} width="25%" color="bg-blue-200" />
              <FunnelRow label="Decision" count={24} width="12%" color="bg-blue-100" />
            </div>
          </div>

          {/* Donut Block (2/5 width) */}
          <div className="col-span-2 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-4">By Position</h3>
            
            <div className="flex justify-center mb-5">
              <DonutChart total={current.total} />
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <LegendRow color="bg-blue-600" label="Software Engineer" val={240} />
              <LegendRow color="bg-pink-400" label="Product Manager" val={80} />
              <LegendRow color="bg-cyan-400" label="UX / UI Designer" val={290} />
              <LegendRow color="bg-green-400" label="Data Analyst" val={180} />
              <LegendRow color="bg-orange-400" label="Data Scientist" val={335} />
            </div>
          </div>
        </div>

        {/* 3. THIRD ROW: COMPACT METRIC BOXES */}
        <div className="grid grid-cols-3 gap-4">
          <MetricBox icon={<FaClock size={14}/>} label="Avg. Time" val={current.time} unit="days" color="bg-blue-50" />
          <MetricBox icon={<FaCheckCircle size={14}/>} label="Success Rate" val={current.success} unit="%" color="bg-purple-50" />
          <MetricBox icon={<FaArrowUp size={14}/>} label="New Hires" val={current.hires} unit="total" color="bg-green-50" />
        </div>

        {/* 4. BOTTOM ROW: SLIMMER BAR CHART */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm text-slate-800">Hires by Month</h3>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500">View:</span>
              <select 
                className="bg-transparent text-[10px] font-bold outline-none cursor-pointer"
                onChange={(e) => setSelectedMonth(e.target.value)}
                value={selectedMonth}
              >
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
              </select>
            </div>
          </div>
          <div className="flex items-end justify-between h-32 px-2 gap-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <div key={m} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="w-full max-w-[20px] bg-slate-50 rounded-t-md flex flex-col justify-end overflow-hidden h-24 relative">
                  <div className="bg-indigo-500 w-full rounded-t-md transition-all duration-500 group-hover:bg-indigo-400" 
                       style={{height: `${Math.random() * 50 + 20}%`}}></div>
                </div>
                <span className={`text-[9px] font-bold ${m === 'Aug' ? 'text-slate-900' : 'text-slate-300'}`}>{m}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- RE-SIZED COMPONENTS ---

const StatCard = ({ label, val, trend, color }) => (
  <div className={`${color} p-4 rounded-xl text-white shadow-sm`}>
    <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest">{label}</p>
    <div className="flex items-center justify-between mt-1">
      <h2 className="text-xl font-black">{val}</h2>
      <span className="text-[8px] font-bold bg-white/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
        <FaArrowUp size={6}/> {trend}
      </span>
    </div>
  </div>
);

const FunnelRow = ({ label, count, width, color }) => (
  <div className="flex items-center gap-4">
    <span className="text-[10px] font-bold text-slate-400 w-20 truncate">{label}</span>
    <div className="flex-1 bg-slate-50 h-1.5 rounded-full overflow-hidden">
      <div className={`${color} h-full transition-all duration-700`} style={{ width }}></div>
    </div>
    <span className="text-[10px] font-bold text-slate-700 w-8 text-right">{count}</span>
  </div>
);

const LegendRow = ({ color, label, val }) => (
  <div className="flex justify-between items-center text-[10px] font-bold py-0.5">
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
      <span className="text-slate-400">{label}</span>
    </div>
    <span className="text-slate-700">{val}</span>
  </div>
);

const MetricBox = ({ icon, label, val, unit, color }) => (
  <div className={`${color} p-4 rounded-xl flex items-center gap-3 border border-white/50`}>
    <div className="bg-white p-2 rounded-lg shadow-xs text-slate-600">{icon}</div>
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
      <h4 className="text-base font-black text-slate-800">{val} <span className="text-[9px] font-normal text-slate-400">{unit}</span></h4>
    </div>
  </div>
);

const DonutChart = ({ total }) => (
  <div className="w-28 h-28 relative"> {/* Shrunk from w-40 to w-28 */}
    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#F8FAFC" strokeWidth="4"></circle>
      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#3B82F6" strokeWidth="4" strokeDasharray="30 100"></circle>
      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-30"></circle>
      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#10B981" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-50"></circle>
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="font-black text-lg text-slate-800 leading-none">{total}</span>
      <span className="text-[8px] uppercase text-slate-300 font-bold">total</span>
    </div>
  </div>
);