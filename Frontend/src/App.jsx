import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/hrPages/Signup";
import Login from "./pages/hrPages/Login";
import ProfilePage from "./pages/hrPages/ProfilePage";
import Dashboard from "./pages/hrPages/Dashboard";
import JobList from "./pages/hrPages/JobPosting";
import ManageApplication from "./pages/hrPages/ManageApplication";
import CandidateInfo from "./pages/hrPages/CandidateInfo";
import RecruitmentWorkflow from "./pages/hrPages/RecruitmentWorkflow";
import PostJob from "./pages/hrPages/PostJob";
import MatrixPage from "./pages/hrPages/MatrixPage";
import EditProfile from "./pages/hrPages/EditPage";
import JobDetailView from "./pages/hrPages/JobDetailView";
import InputResume from "./pages/hrPages/InputResume";

// Sana Candidate Pages import 
import Layout from "./components/Layout";
import LandingPage from "./pages/candidatePages/LandingPage";
import ProfileCandidatePage from "./pages/candidatePages/ProfileCandidatePage";
import CVPage from "./pages/candidatePages/CVPage";
import UploadCV from "./pages/candidatePages/UploadCV";
import ViewJobsPage from "./pages/candidatePages/ViewJobsPage";
import JobDetails from "./pages/candidatePages/JobDetails";
import ApplyJob from "./pages/candidatePages/ApplyJob";
import ApplicationPage from "./pages/candidatePages/ApplicationPage";
import Notifications from "./pages/candidatePages/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        
        {/* Auth Routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/inputresume" element={<InputResume />} />
        <Route path="/login" element={<Login />} />
        
        {/* User & Settings Routes */}
        <Route path="/profile-page" element={<ProfilePage />} />
        
        {/* Core Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/job-listing" element={<JobList />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/manage-application" element={<ManageApplication />} />
        <Route path="/candidate-information" element={<CandidateInfo />} />
        
        {/* Configuration Routes - Exact match for ProfilePage links */}
        <Route path="/recruitment-workflow" element={<RecruitmentWorkflow />} />
        <Route path="/matrix-page" element={<MatrixPage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/job-detail/:id" element={<JobDetailView />} />

         {/* Sana Candidate Routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/uploadcv" element={<UploadCV />} />
        <Route path="/profile" element={<Layout><ProfileCandidatePage /></Layout>} />
        <Route path="/cv" element={<Layout><CVPage /></Layout>} />
        <Route path="/view-jobs" element={<Layout><ViewJobsPage /></Layout>} />
        <Route path="/job-details/:jobId" element={<Layout><JobDetails /></Layout>} />
        <Route path="/apply-job/:jobId" element={<Layout><ApplyJob /></Layout>} />
        <Route path="/application" element={<Layout><ApplicationPage /></Layout>} />
        <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;