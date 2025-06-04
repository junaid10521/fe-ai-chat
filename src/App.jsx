import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AgentTable from "./components/AgentTable";
import InformationSources from "./components/InformationSources";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1 style={{ textAlign: "center" }}>AI Agents</h1>
              <AgentTable />
            </div>
          }
        />
        <Route path="/information-sources" element={<InformationSources />} />
      </Routes>
    </Router>
  );
}

export default App;
