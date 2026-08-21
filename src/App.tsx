/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IatpcCulturePage } from './pages/IatpcCulturePage';
import { KoreaCultureJournalPage } from './pages/KoreaCultureJournalPage';
import { Globe2, Newspaper, ArrowRight } from 'lucide-react';

export type AppPage = 'iatpc_culture' | 'korea_culture_journal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('iatpc_culture');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Top Global Portal Switcher Bar (IATPC 문화 & 한국문화저널 독립 페이지 선택) */}
      <div className="bg-[#080d1a] border-b border-slate-800 text-xs text-slate-300 py-1.5 px-4 lg:px-8 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          {/* Left Brand Badge */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">IATPC 문화 통합 플랫폼</span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">독립 포털 & 언론 지면 선택</span>
          </div>

          {/* Center / Right Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-700/60 shadow-xs">
            <button
              onClick={() => setCurrentPage('iatpc_culture')}
              className={`px-3 py-1 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all ${
                currentPage === 'iatpc_culture'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>IATPC 문화 (협회 포털)</span>
            </button>

            <button
              onClick={() => setCurrentPage('korea_culture_journal')}
              className={`px-3 py-1 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all ${
                currentPage === 'korea_culture_journal'
                  ? 'bg-[#0051a8] text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>한국문화저널 (독립 언론사 지면)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Independent Standalone Page based on selection */}
      <div className="flex-1">
        {currentPage === 'iatpc_culture' ? (
          <IatpcCulturePage
            onNavigateToJournal={() => setCurrentPage('korea_culture_journal')}
          />
        ) : (
          <KoreaCultureJournalPage />
        )}
      </div>
    </div>
  );
}
