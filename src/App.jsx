import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login/Login";
import Workspace from "./pages/Workspace/Workspace";
import Board from "./pages/Board/Board";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/board/:boardId" element={<Board />} />
      </Routes>
    </Router>
  );
}

export default App;
