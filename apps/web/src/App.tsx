import { Link, Route, Routes } from 'react-router-dom';
import { Landing } from './landing/Landing';
import { EventWorkspace, samples, WorkspaceLayout } from './workspace/Workspace';
import { AuthProvider, RequireAccount } from './auth/Auth';
import { NewEvent, SavedEvent, SavedOccasions } from './workspace/SavedEvents';
import './workspace/workspace.css';
export function App() {
  return <AuthProvider><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/app" element={<WorkspaceLayout><RequireAccount><SavedOccasions /></RequireAccount></WorkspaceLayout>} />
    <Route path="/app/new" element={<WorkspaceLayout><RequireAccount><NewEvent /></RequireAccount></WorkspaceLayout>} />
    <Route path="/app/events/:id" element={<WorkspaceLayout><RequireAccount><SavedEvent /></RequireAccount></WorkspaceLayout>} />
    <Route path="/demo" element={<WorkspaceLayout><EventWorkspace repository={samples} demo /></WorkspaceLayout>} />
    <Route path="*" element={<WorkspaceLayout><h1>Page not found</h1><Link to="/app">Return to your workspace</Link></WorkspaceLayout>} />
  </Routes></AuthProvider>;
}
