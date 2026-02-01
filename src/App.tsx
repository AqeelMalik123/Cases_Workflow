import { Routes, Route, Link, Navigate } from "react-router-dom";
import CasesList from "./pages/CasesList";
import CaseDetail from "./pages/CaseDetail";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 6 }}>Cases Workflow</h1>
        <nav style={{ marginBottom: 10 }}>
          <Link to="/cases">Cases</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/cases" replace />} />
          <Route path="/cases" element={<CasesList />} />
          <Route path="/cases/:caseId" element={<CaseDetail />} />
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </main>
    </div>
  );
}
