import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Room from "./components/Room";
import PrejoinScreen from "./components/prejoinScreen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/preview/:roomId" element={<PrejoinScreen />} />
        <Route path="/:roomId" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;
