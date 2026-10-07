import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DocumentsView } from './components/DocumentsView';
import { AnalystView } from './components/AnalystView';
import { InsightsView } from './components/InsightsView';
import { RecommendationsView } from './components/RecommendationsView';
import { ScenarioView } from './components/ScenarioView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { DocumentItem, EvidenceItem } from './types';
import { fetchDocuments } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceItem | null>(null);

  const loadDocs = () => {
    fetchDocuments().then(setDocuments).catch(console.error);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleOpenEvidence = (
    docName: string, 
    pageNum: number, 
    snippet: string, 
    type: 'chart' | 'table' | 'text' | 'image' = 'text'
  ) => {
    setActiveEvidence({
      document_name: docName,
      page_number: pageNum,
      snippet: snippet,
      content_type: type,
      section: `Page ${pageNum} Reference`,
      source_reference: `${docName} — Page ${pageNum}`,
      image_url: `/processed/test-doc-1/pages/page_${pageNum}.png`
    });
  };

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        documentCount={documents.length} 
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              DocuMind AI
            </span>
            <span>/</span>
            <span className="capitalize text-indigo-400 font-medium">
              {currentTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[11px]">
              HackNex 2026 Qualifier
            </span>
          </div>
        </header>

        <div className="p-8 flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView 
              documents={documents} 
              setCurrentTab={setCurrentTab} 
              refreshDocuments={loadDocs}
              onOpenEvidence={handleOpenEvidence}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentsView 
              documents={documents} 
              refreshDocuments={loadDocs}
              onOpenEvidence={handleOpenEvidence}
            />
          )}

          {currentTab === 'analyst' && (
            <AnalystView 
              documents={documents}
              onOpenEvidence={handleOpenEvidence}
            />
          )}

          {currentTab === 'insights' && (
            <InsightsView onOpenEvidence={handleOpenEvidence} />
          )}

          {currentTab === 'recommendations' && (
            <RecommendationsView onOpenEvidence={handleOpenEvidence} />
          )}

          {currentTab === 'scenario' && (
            <ScenarioView />
          )}

          {currentTab === 'history' && (
            <HistoryView onOpenEvidence={handleOpenEvidence} />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}
        </div>
      </main>

      {/* Global Interactive Evidence Drawer */}
      <EvidenceDrawer 
        evidence={activeEvidence} 
        onClose={() => setActiveEvidence(null)} 
      />
    </div>
  );
}

export default App;
