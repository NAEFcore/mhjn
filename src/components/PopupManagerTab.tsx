import React, { useState, useEffect } from 'react';
import { PopupConfig, DualPopupsConfig, PopupPosition, PopupScopeTarget } from '../types';
import { 
  Layers, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Sliders, 
  Sparkles,
  Monitor,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { DEFAULT_POPUP_CONFIG_1, DEFAULT_POPUP_CONFIG_2 } from '../utils/storage';
import { saveDualPopupsConfigToFirestore } from '../firebase';

interface PopupManagerTabProps {
  dualPopupsConfig?: DualPopupsConfig;
  onUpdateDualPopupsConfig?: (cfg: DualPopupsConfig) => void;
  // Fallback / legacy support
  popupConfig?: PopupConfig;
  onUpdatePopupConfig?: (cfg: PopupConfig) => void;
}

export const PopupManagerTab: React.FC<PopupManagerTabProps> = ({
  dualPopupsConfig,
  onUpdateDualPopupsConfig,
  popupConfig,
  onUpdatePopupConfig,
}) => {
  // Active editing tab between Popup 1 and Popup 2
  const [selectedPopupIndex, setSelectedPopupIndex] = useState<'popup1' | 'popup2'>('popup1');

  // Interactive Live Tester Scope Selector
  const [simulatedScope, setSimulatedScope] = useState<PopupScopeTarget>('main_home');

  // Form state holding both popups
  const [form, setForm] = useState<DualPopupsConfig>(() => {
    if (dualPopupsConfig) {
      return {
        popup1: { ...DEFAULT_POPUP_CONFIG_1, ...dualPopupsConfig.popup1 },
        popup2: { ...DEFAULT_POPUP_CONFIG_2, ...dualPopupsConfig.popup2 },
      };
    }
    if (popupConfig) {
      return {
        popup1: { ...DEFAULT_POPUP_CONFIG_1, ...popupConfig },
        popup2: DEFAULT_POPUP_CONFIG_2,
      };
    }
    return {
      popup1: DEFAULT_POPUP_CONFIG_1,
      popup2: DEFAULT_POPUP_CONFIG_2,
    };
  });

  // Keep form in sync if external props update
  useEffect(() => {
    if (dualPopupsConfig) {
      setForm({
        popup1: { ...DEFAULT_POPUP_CONFIG_1, ...(dualPopupsConfig.popup1 || {}) },
        popup2: { ...DEFAULT_POPUP_CONFIG_2, ...(dualPopupsConfig.popup2 || {}) },
      });
    }
  }, [dualPopupsConfig]);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const activeForm = form[selectedPopupIndex];

  const updateActivePopup = (patch: Partial<PopupConfig>) => {
    setForm(prev => ({
      ...prev,
      [selectedPopupIndex]: {
        ...prev[selectedPopupIndex],
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleSave = async () => {
    if (onUpdateDualPopupsConfig) {
      onUpdateDualPopupsConfig(form);
    } else if (onUpdatePopupConfig) {
      onUpdatePopupConfig(form.popup1);
    }

    // Save directly to Firestore for multi-device sync
    try {
      await saveDualPopupsConfigToFirestore(form);
    } catch (e) {
      console.warn('Firestore popup save error:', e);
    }

    try {
      await fetch('/api/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popups: form }),
      });
    } catch (e) {
      console.warn('Backend popups sync failed, saved locally');
    }

    setSaveMessage('팝업 1 & 2 다중화 설정이 성공적으로 저장되었습니다! 즉시 사이트에 적용됩니다.');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleReset24hDismiss = () => {
    localStorage.removeItem(`kculture_popup_dismissed_${form.popup1.id}`);
    localStorage.removeItem(`kculture_popup_dismissed_${form.popup2.id}`);
    setSaveMessage('모든 팝업의 ‘오늘 하루 안보기’ 캐시가 초기화되었습니다. 새로고침 시 팝업이 다시 노출됩니다.');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  // Helper to check if a popup is visible under a specific simulated scope
  const isPopupExposedInScope = (cfg: PopupConfig, scope: PopupScopeTarget) => {
    if (!cfg.enabled) return false;
    if (!cfg.pageScope || cfg.pageScope === 'all') return true;
    return cfg.pageScope === scope;
  };

  const popup1ActiveInScope = isPopupExposedInScope(form.popup1, simulatedScope);
  const popup2ActiveInScope = isPopupExposedInScope(form.popup2, simulatedScope);

  return (
    <div className="space-y-6 text-xs font-sans max-w-5xl">
      {/* Header Info */}
      <div className="p-4 bg-gradient-to-r from-[#1b2a47]/5 via-amber-50 to-blue-50/50 border border-[#d8d3cb] rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#1b2a47] text-amber-300 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="font-serif-kr text-base font-bold text-slate-900">
              다중 레이어 팝업 관리 시스템 (최대 2개 동시 노출 & 페이지별 세분화)
            </h3>
          </div>
          <p className="text-slate-600 text-[11px]">
            메인 뉴스앱(메인홈/기사상세)과 서브 뉴스앱(서브홈/기사상세)을 구분하여 2개의 팝업을 독립적으로 지정하고 동시에 노출할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>팝업 설정 전체 저장 및 적용</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* User Verification / Live Tester Interactive Panel (Requirement 4 direct answer) */}
      <div className="p-4 bg-white border-2 border-indigo-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-100 text-indigo-800 rounded-md">
              <Monitor className="w-4 h-4" />
            </span>
            <strong className="text-slate-900 font-serif-kr text-sm">
              🔍 팝업 노출 범위 실시간 시뮬레이션 및 직접 확인기
            </strong>
          </div>
          <span className="text-[11px] text-slate-500">
            * 각 페이지 위치별로 팝업 1과 팝업 2가 어떻게 노출되는지 직접 클릭하여 즉시 검증할 수 있습니다.
          </span>
        </div>

        {/* Scope Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => setSimulatedScope('main_home')}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
              simulatedScope === 'main_home'
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50'
            }`}
          >
            <span className="font-bold text-xs font-serif-kr">1. 메인뉴스 메인홈</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              simulatedScope === 'main_home' ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-200 text-slate-600'
            }`}>
              URL: / (홈)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSimulatedScope('main_detail')}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
              simulatedScope === 'main_detail'
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50'
            }`}
          >
            <span className="font-bold text-xs font-serif-kr">2. 메인뉴스 기사상세</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              simulatedScope === 'main_detail' ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-200 text-slate-600'
            }`}>
              URL: /article/:id
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSimulatedScope('sub_home')}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
              simulatedScope === 'sub_home'
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50'
            }`}
          >
            <span className="font-bold text-xs font-serif-kr">3. 서브뉴스 메인홈</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              simulatedScope === 'sub_home' ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-200 text-slate-600'
            }`}>
              URL: /sub-news
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSimulatedScope('sub_detail')}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
              simulatedScope === 'sub_detail'
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50'
            }`}
          >
            <span className="font-bold text-xs font-serif-kr">4. 서브뉴스 기사상세</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              simulatedScope === 'sub_detail' ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-200 text-slate-600'
            }`}>
              URL: /sub-news/article/:id
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSimulatedScope('kcj_radio')}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
              simulatedScope === 'kcj_radio'
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50'
            }`}
          >
            <span className="font-bold text-xs font-serif-kr">5. KCJ Radio 방송국</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              simulatedScope === 'kcj_radio' ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-200 text-slate-600'
            }`}>
              URL: /kcj-radio
            </span>
          </button>
        </div>

        {/* Live Status Result for Selected Simulated Scope */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-800">
              현재 선택된 페이지 ({
                simulatedScope === 'main_home' ? '메인뉴스 메인페이지' :
                simulatedScope === 'main_detail' ? '메인뉴스 기사상세' :
                simulatedScope === 'sub_home' ? '서브뉴스 메인페이지' :
                simulatedScope === 'sub_detail' ? '서브뉴스 기사상세' :
                simulatedScope === 'kcj_radio' ? 'KCJ Radio 방송국' : '전체'
              }) 노출 진단:
            </span>

            {/* Popup 1 Status Pill */}
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
              popup1ActiveInScope ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-300'
            }`}>
              <span>[팝업 1] {form.popup1.name}</span>
              <span>{popup1ActiveInScope ? '🟢 화면에 노출됨' : '⚪ 미노출 (조건 불일치/OFF)'}</span>
            </div>

            {/* Popup 2 Status Pill */}
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
              popup2ActiveInScope ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-300'
            }`}>
              <span>[팝업 2] {form.popup2.name}</span>
              <span>{popup2ActiveInScope ? '🟢 화면에 노출됨' : '⚪ 미노출 (조건 불일치/OFF)'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset24hDismiss}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-600" />
            <span>‘오늘 하루 안보기’ 캐시 리셋</span>
          </button>
        </div>
      </div>

      {/* Dual Popup Switcher Tabs (Popup 1 vs Popup 2) */}
      <div className="flex items-center gap-3 border-b border-slate-300 pb-3">
        <button
          type="button"
          onClick={() => setSelectedPopupIndex('popup1')}
          className={`flex-1 p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
            selectedPopupIndex === 'popup1'
              ? 'bg-[#1b2a47] text-white border-[#1b2a47] shadow-sm'
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                selectedPopupIndex === 'popup1' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <strong className="text-sm font-serif-kr">팝업 1 설정</strong>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                form.popup1.enabled 
                  ? selectedPopupIndex === 'popup1' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {form.popup1.enabled ? 'ON (활성)' : 'OFF'}
              </span>
            </div>
            <p className={`text-[11px] mt-1 truncate ${selectedPopupIndex === 'popup1' ? 'text-slate-300' : 'text-slate-500'}`}>
              {form.popup1.name || '미지정'} · 위치: {form.popup1.position} · 범위: {
                form.popup1.pageScope === 'all' ? '전체 페이지' :
                form.popup1.pageScope === 'main_home' ? '메인뉴스 메인페이지' :
                form.popup1.pageScope === 'main_detail' ? '메인뉴스 기사상세' :
                form.popup1.pageScope === 'sub_home' ? '서브뉴스 메인페이지' : '서브뉴스 기사상세'
              }
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPopupIndex('popup2')}
          className={`flex-1 p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
            selectedPopupIndex === 'popup2'
              ? 'bg-[#1b2a47] text-white border-[#1b2a47] shadow-sm'
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                selectedPopupIndex === 'popup2' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <strong className="text-sm font-serif-kr">팝업 2 설정</strong>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                form.popup2.enabled 
                  ? selectedPopupIndex === 'popup2' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {form.popup2.enabled ? 'ON (활성)' : 'OFF'}
              </span>
            </div>
            <p className={`text-[11px] mt-1 truncate ${selectedPopupIndex === 'popup2' ? 'text-slate-300' : 'text-slate-500'}`}>
              {form.popup2.name || '미지정'} · 위치: {form.popup2.position} · 범위: {
                form.popup2.pageScope === 'all' ? '전체 페이지' :
                form.popup2.pageScope === 'main_home' ? '메인뉴스 메인페이지' :
                form.popup2.pageScope === 'main_detail' ? '메인뉴스 기사상세' :
                form.popup2.pageScope === 'sub_home' ? '서브뉴스 메인페이지' :
                form.popup2.pageScope === 'sub_detail' ? '서브뉴스 기사상세' :
                form.popup2.pageScope === 'kcj_radio' ? 'KCJ Radio 방송국' : '전체 페이지'
              }
            </p>
          </div>
        </button>
      </div>

      {/* Settings Grid for Currently Selected Popup */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Form Inputs (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Enable / Disable Switch */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <strong className="block text-slate-900 text-sm font-serif-kr">
                [{selectedPopupIndex === 'popup1' ? '팝업 1' : '팝업 2'}] 활성화 상태 (ON / OFF)
              </strong>
              <span className="text-slate-500 text-[11px]">
                ON으로 설정하면 지정된 노출 범위 조건에 맞는 페이지에서 팝업이 출력됩니다.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activeForm.enabled}
                onChange={(e) => updateActivePopup({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1b2a47]"></div>
            </label>
          </div>

          {/* Page Scope Targeting (Requirement 3: 메인뉴스 메인페이지/상세페이지, 서브뉴스 메인페이지/상세페이지) */}
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
            <label className="block font-bold text-slate-900 text-xs font-serif-kr flex items-center gap-1.5">
              <span>🎯 노출 대상 페이지 범위 (Scope) *</span>
            </label>
            <select
              value={activeForm.pageScope || 'all'}
              onChange={(e) => updateActivePopup({ pageScope: e.target.value as PopupScopeTarget })}
              className="w-full p-2.5 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 font-bold focus:outline-none focus:border-[#1b2a47]"
            >
              <option value="all">🌐 전 영역 공통 노출 (모든 페이지)</option>
              <option value="main_home">📰 1. 메인뉴스 메인페이지 (한국문화저널 홈)</option>
              <option value="main_detail">📄 2. 메인뉴스 기사 상세페이지</option>
              <option value="sub_home">📊 3. 서브뉴스 메인페이지 (분야별 포털 홈)</option>
              <option value="sub_detail">📑 4. 서브뉴스 기사 상세페이지</option>
              <option value="kcj_radio">🎙️ 5. KCJ Radio 방송국 페이지</option>
            </select>
            <p className="text-[11px] text-slate-600">
              * 특정 채널이나 기사 상세 페이지만 골라 타겟팅하여 팝업을 차별화 노출할 수 있습니다.
            </p>
          </div>

          {/* Popup Name / Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">팝업 식별 이름 (상단 바 타이틀)</label>
            <input
              type="text"
              value={activeForm.name || ''}
              onChange={(e) => updateActivePopup({ name: e.target.value })}
              placeholder="예: 2026 한국문화저널 특별 공지"
              className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 font-serif-kr font-bold focus:outline-none focus:border-[#1b2a47]"
            />
          </div>

          {/* Position & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">노출 위치 (Position) *</label>
              <select
                value={activeForm.position}
                onChange={(e) => updateActivePopup({ position: e.target.value as PopupPosition })}
                className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
              >
                <option value="TOP_RIGHT">상단 우측 (TOP_RIGHT) - 팝업1 권장</option>
                <option value="TOP_LEFT">상단 좌측 (TOP_LEFT) - 팝업2 권장</option>
                <option value="BOTTOM_RIGHT">하단 우측 (BOTTOM_RIGHT)</option>
                <option value="BOTTOM_LEFT">하단 좌측 (BOTTOM_LEFT)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">가로 너비 (Width in px)</label>
              <input
                type="number"
                min={240}
                max={600}
                value={activeForm.width || 340}
                onChange={(e) => updateActivePopup({ width: Number(e.target.value) })}
                className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">팝업 이미지 URL</label>
            <input
              type="url"
              value={activeForm.imageUrl || ''}
              onChange={(e) => updateActivePopup({ imageUrl: e.target.value })}
              placeholder="https://... 팝업에 표시할 고화질 이미지 주소"
              className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
            />
          </div>

          {/* Text Content */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">팝업 본문 텍스트</label>
            <textarea
              rows={3}
              value={activeForm.text || ''}
              onChange={(e) => updateActivePopup({ text: e.target.value })}
              placeholder="팝업에 노출할 상세 안내 문구를 입력하세요"
              className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 font-serif-kr resize-none focus:outline-none focus:border-[#1b2a47]"
            />
          </div>

          {/* Link URL & Open New Tab */}
          <div className="space-y-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">클릭 시 이동할 링크 URL</label>
              <input
                type="url"
                value={activeForm.linkUrl || ''}
                onChange={(e) => updateActivePopup({ linkUrl: e.target.value })}
                placeholder="https://... 클릭 시 이동할 웹페이지 주소"
                className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={activeForm.openNewTab !== false}
                onChange={(e) => updateActivePopup({ openNewTab: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-[#1b2a47] focus:ring-amber-500"
              />
              <span className="font-bold text-slate-800">링크 클릭 시 새 창(_blank)으로 열기</span>
            </label>
          </div>
        </div>

        {/* Right Column: Live Visual Preview (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="font-serif-kr font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#1b2a47]" />
              <span>[{selectedPopupIndex === 'popup1' ? '팝업 1' : '팝업 2'}] 실시간 미리보기</span>
            </span>
            <span className="text-[10px] text-slate-500">
              위치: {activeForm.position} ({activeForm.width}px)
            </span>
          </div>

          <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 min-h-[380px] flex items-center justify-center">
            {/* Mocked Live Popup Container */}
            <div
              style={{ width: `${Math.min(activeForm.width || 340, 320)}px` }}
              className="bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col transition-all"
            >
              <div className="bg-[#1b2a47] text-white px-3 py-2 flex items-center justify-between text-xs font-bold font-serif-kr">
                <span className="truncate pr-2">{activeForm.name || '한국문화저널 공지'}</span>
                <span className="text-slate-400 text-xs">✕</span>
              </div>

              <div className="p-3 bg-white space-y-2">
                {activeForm.imageUrl && (
                  <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={activeForm.imageUrl}
                      alt="미리보기"
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover"
                    />
                  </div>
                )}

                {activeForm.text && (
                  <p className="text-xs text-slate-800 font-serif-kr leading-relaxed line-clamp-3">
                    {activeForm.text}
                  </p>
                )}

                {activeForm.linkUrl && (
                  <div className="text-[11px] text-blue-600 flex items-center gap-1">
                    <span className="truncate">{activeForm.linkUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </div>
                )}
              </div>

              <div className="bg-[#f8f6f2] border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[10px] text-slate-600">
                <label className="flex items-center gap-1">
                  <input type="checkbox" disabled className="rounded border-slate-300 w-3 h-3" />
                  <span>오늘 하루 열지 않기</span>
                </label>
                <button disabled className="px-2 py-0.5 bg-[#1b2a47] text-white rounded text-[10px] font-bold">
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
