import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import ParticipantListPage from "@/pages/ParticipantListPage";
import AudioRatingPage from "@/pages/AudioRatingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/participants" element={<ParticipantListPage />} />
      <Route path="/participants/:participantId" element={<AudioRatingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
