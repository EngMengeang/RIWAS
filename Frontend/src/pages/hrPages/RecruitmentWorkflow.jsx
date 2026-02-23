import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar";

const stepTypes = [
  { name: "Application", color: "bg-blue-500" },
  { name: "Screening", color: "bg-purple-500" },
  { name: "Interview", color: "bg-orange-500" },
  { name: "Assessment", color: "bg-pink-500" },
  { name: "Reference", color: "bg-gray-500" },
  { name: "Decision", color: "bg-indigo-500" },
  { name: "Job Offer", color: "bg-green-500" },
];

export default function RecruitmentWorkflow() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([
    { id: 1, name: "Standard Hiring", steps: ["Application", "Screening", "Interview"], active: true },
    { id: 2, name: "Technical Role", steps: ["Application", "Assessment", "Interview", "Job Offer"], active: false },
  ]);

  const [mode, setMode] = useState("list"); 
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [selectedSteps, setSelectedSteps] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSelectAllWorkflows = (e) => {
    setSelectedIds(e.target.checked ? workflows.map((w) => w.id) : []);
  };

  const handleSelectOneWorkflow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const triggerDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setWorkflows(workflows.filter((w) => !selectedIds.includes(w.id)));
    setSelectedIds([]);
    setIsDeleteModalOpen(false);
  };

  const toggleStep = (step) => {
    setSelectedSteps(prev => 
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  const saveWorkflow = () => {
    if (!newWorkflowName) return alert("Please enter a workflow name");
    if (mode === "create") {
      setWorkflows([...workflows, { id: Date.now(), name: newWorkflowName, steps: selectedSteps }]);
    } else {
      setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? { ...w, name: newWorkflowName, steps: selectedSteps } : w));
    }
    setMode("list");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />

      <main className="flex-1 ml-[227px] p-8">
        <div className="flex justify-between items-center border-b border-green-500 pb-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Recruitment Process Workflow</h2>
          <button
            onClick={() => mode === "list" ? navigate(-1) : setMode("list")}
            className="bg-white border px-6 py-2 rounded-xl hover:bg-gray-50 font-medium shadow-sm"
          >
            Back
          </button>
        </div>

        <div className="flex gap-8">
          <div className="w-64 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold mb-4 text-sm uppercase text-gray-400">Step Types</h3>
            <div className="space-y-3">
              {stepTypes.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${step.color}`} />
                  <span className="text-sm font-medium text-gray-600">{step.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
            
            {/* LIST MODE */}
            {mode === "list" && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border">
                      <input type="checkbox" className="accent-green-500" onChange={handleSelectAllWorkflows} checked={selectedIds.length === workflows.length && workflows.length > 0} />
                      <span className="text-sm font-bold text-gray-600">Select All</span>
                    </label>
                    {selectedIds.length > 0 && (
                      <button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold border border-red-100">
                        Delete Selected ({selectedIds.length})
                      </button>
                    )}
                  </div>
                  <button onClick={() => { setMode("create"); setNewWorkflowName(""); setSelectedSteps([]); }} className="bg-green-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-green-600 shadow-lg shadow-green-100">
                    + Add Workflow
                  </button>
                </div>

                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className={`flex items-center gap-4 border p-4 rounded-2xl transition-all ${selectedIds.includes(workflow.id) ? "border-green-500 bg-green-50/30" : "border-gray-100"}`}>
                      <input type="checkbox" className="w-5 h-5 accent-green-500" checked={selectedIds.includes(workflow.id)} onChange={() => handleSelectOneWorkflow(workflow.id)} />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{workflow.name}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{workflow.steps.length} Steps</p>
                      </div>

                      {/* BUTTONS ALWAYS VISIBLE */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedWorkflow(workflow); setMode("view"); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                        <button onClick={() => { setSelectedWorkflow(workflow); setSelectedSteps(workflow.steps); setNewWorkflowName(workflow.name); setMode("edit"); }} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onClick={() => triggerDelete([workflow.id])} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* VIEW MODE - THIS WAS MISSING/BROKEN */}
            {mode === "view" && selectedWorkflow && (
              <div className="animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedWorkflow.name}</h3>
                  <button onClick={() => setMode("list")} className="text-green-600 font-bold hover:underline">Close View</button>
                </div>
                
                <div className="relative border-l-4 border-green-500 ml-4 pl-10 space-y-8">
                  {selectedWorkflow.steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[54px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-green-500 rounded-full shadow-sm" />
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 inline-block min-w-[300px] shadow-sm">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest block mb-1">Step {idx + 1}</span>
                        <span className="text-lg font-bold text-gray-700">{step}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CREATE/EDIT MODE */}
            {(mode === "create" || mode === "edit") && (
              <div className="max-w-xl">
                <h3 className="text-xl font-bold mb-6 text-gray-800">{mode === "create" ? "Create Workflow" : "Update Workflow"}</h3>
                <input placeholder="Workflow Name" value={newWorkflowName} onChange={(e) => setNewWorkflowName(e.target.value)} className="w-full border p-4 mb-6 rounded-2xl bg-gray-50 focus:bg-white outline-green-500 transition-all" />
                
                <div className="flex justify-between items-center mb-4">
                  <p className="font-bold">Select Steps</p>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-400">
                    <input type="checkbox" className="accent-green-600" checked={selectedSteps.length === stepTypes.length} onChange={(e) => setSelectedSteps(e.target.checked ? stepTypes.map(s => s.name) : [])} />
                    Select All Steps
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {stepTypes.map((step) => (
                    <label key={step.name} className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${selectedSteps.includes(step.name) ? "border-green-500 bg-green-50" : "border-gray-100 hover:bg-gray-50"}`}>
                      <span className="text-sm font-bold text-gray-700">{step.name}</span>
                      <input type="checkbox" checked={selectedSteps.includes(step.name)} onChange={() => toggleStep(step.name)} className="w-4 h-4 accent-green-600" />
                    </label>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <button onClick={() => setMode("list")} className="flex-1 py-4 border rounded-2xl font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                  <button onClick={saveWorkflow} className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black shadow-lg shadow-green-100">Save Workflow</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DELETE MODAL */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-10 rounded-[40px] w-full max-w-[420px] shadow-2xl text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">Are you sure?</h3>
              <p className="text-gray-500 mb-10 leading-relaxed">You're deleting <span className="font-bold text-red-600">{selectedIds.length}</span> workflow(s) permanently.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 shadow-xl shadow-red-100">Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}