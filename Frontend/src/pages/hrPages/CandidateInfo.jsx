import React from "react";
import SideBar from "../../components/SideBar";

export default function CandidateInfo() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SideBar />

      <main className="flex-1 ml-[227px] p-10">
        <h2 className="text-2xl font-semibold mb-8">Candidate Information</h2>
      </main>
    </div>
  );
}
