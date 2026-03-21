import { WorkflowDefinition } from "../models/WorkflowDefinition.js";

const DEFAULT_STAGES = [
  { order: 1, name: "Application", color: "#a78bfa", description: "Candidate has submitted their application." },
  { order: 2, name: "Screening",   color: "#67e8f9", description: "Application is being reviewed by the recruitment team." },
  { order: 3, name: "Interview",   color: "#6ee7b7", description: "Candidate has been invited for an interview." },
  { order: 4, name: "Assessment",  color: "#93c5fd", description: "Candidate is completing an assessment or test." },
  { order: 5, name: "References",  color: "#fcd34d", description: "Reference checks are being conducted." },
  { order: 6, name: "Decision",    color: "#f97316", description: "Final hiring decision is being made." },
  { order: 7, name: "Job Offer",   color: "#4ade80", description: "An offer has been extended to the candidate." },
];

export async function seedWorkflowDefinitions() {
  const count = await WorkflowDefinition.count();
  if (count > 0) {
    console.log("[WorkflowDefinition] Seed skipped — table already has data.");
    return;
  }
  await WorkflowDefinition.bulkCreate(DEFAULT_STAGES);
  console.log("[WorkflowDefinition] Default workflow stages seeded.");
}