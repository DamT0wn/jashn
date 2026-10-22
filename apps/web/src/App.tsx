import { useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import type { EventBrief } from '@jashn/contracts';
import { Landing } from './landing/Landing';
import { EventWorkspace, Occasions, samples, WorkspaceLayout } from './workspace/Workspace';
import { Wizard } from './workspace/Wizard';
import { draftRepository } from './workspace/repository';
import './workspace/workspace.css';

export function App() {
  const [draft, setDraft] = useState<EventBrief | null>(null);
  const repository = useMemo(() => draftRepository(draft), [draft]);
  return <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/app" element={<WorkspaceLayout><Occasions draft={draft} /></WorkspaceLayout>} />
    <Route path="/app/new" element={<WorkspaceLayout><Wizard onConfirm={setDraft} /></WorkspaceLayout>} />
    <Route path="/app/events/:id" element={<WorkspaceLayout><EventWorkspace repository={repository} /></WorkspaceLayout>} />
    <Route path="/demo" element={<WorkspaceLayout><EventWorkspace repository={samples} demo /></WorkspaceLayout>} />
    <Route path="*" element={<WorkspaceLayout><h1>Page not found</h1><Link to="/app">Return to your workspace</Link></WorkspaceLayout>} />
  </Routes>;
}
