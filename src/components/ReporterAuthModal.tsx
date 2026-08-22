import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Key, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  UserPlus, 
  Building, 
  Mail, 
  Image as ImageIcon 
} from 'lucide-react';
import { AuthUser, Reporter } from '../types';

interface ReporterAuthModalProps {
  onClose: () => void;
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
  onRegisterReporter: (newReporter: Reporter, newAuth: AuthUser) => void;
}

export const ReporterAuthModal: React.FC<ReporterAuthModalProps> = ({
  onClose,
  currentUser,
  onLoginSuccess,
  onRegisterReporter,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'EDITOR_IN_CHIEF' | 'REPORTER'>('EDITOR_IN_CHIEF');
  const [loginError, setLoginError] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState('문화부');
  const [regTitle, setRegTitle] = useState('취재기자');
  const [regBio, setRegBio] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginRole === 'EDITOR_IN_CHIEF') {
      // Strictly authenticate Editor-in-Chief
      if (loginEmail.trim() === 'soobakmu@naver.com' && loginPassword === 'soobakone1#') {
        const editorUser: AuthUser = {
          id: 'user-editor-01',
          name: '편집국장 (수석 데스크)',
          email: 'soobakmu@naver.com',
          role: 'EDITOR_IN_CHIEF',
          department: '편집국',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        };
        onLoginSuccess(editorUser);
        onClose();
      } else {
        setLoginError('편집국장 계정 이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } else {
      // Reporter login
      if (!loginEmail.trim() || !loginPassword) {
        setLoginError('이메일과 비밀번호를 입력해주세요.');
        return;
      }
      const reporterUser: AuthUser = {
        id: `user-${Date.now()}`,
        name: loginEmail.split('@')[0] + ' 기자',
        email: loginEmail,
        role: 'REPORTER',
        department: '문화부',
        reporterId: 'rep_custom',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      };
      onLoginSuccess(reporterUser);
      onClose();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      alert('필수 입력 항목을 모두 작성해주세요.');
      return;
    }

    const newId = `rep-${Date.now()}`;
    const newReporter: Reporter = {
      id: newId,
      name: regName,
      title: regTitle,
      department: regDept,
      email: regEmail,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      bio: regBio || `${regDept} 출입 취재기자`,
      subscriberCount: 1,
      cheerCount: 0,
      status: 'PENDING_APPROVAL', // Registered with PENDING_APPROVAL status for Editor-in-Chief approval
      joinedDate: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' }),
    };

    const newAuth: AuthUser = {
      id: `user-${newId}`,
      name: regName,
      email: regEmail,
      role: 'REPORTER',
      department: regDept,
      reporterId: newId,
      avatar: newReporter.avatar,
    };

    onRegisterReporter(newReporter, newAuth);
    setRegSuccess(true);
    setTimeout(() => {
      onLoginSuccess(newAuth);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#fcfaf7] border border-[#d8d3cb] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1b2a47] text-white flex items-center justify-between border-b border-[#2d3e5f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-kr text-base font-bold">한국문화저널 기자단 & 편집국 데스크</h3>
              <p className="text-[11px] text-slate-300 font-sans">
                기자 등록, 로그인 및 기사 송고 시스템
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#e2ded6] bg-[#f5f1eb] text-xs font-bold font-serif-kr">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              tab === 'login' 
                ? 'border-[#1b2a47] text-[#1b2a47] bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            기자 / 편집국장 로그인
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              tab === 'register' 
                ? 'border-[#1b2a47] text-[#1b2a47] bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            신규 기자 회원가입
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white overflow-y-auto max-h-[75vh]">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Role Select */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">접속 권한 선택</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('EDITOR_IN_CHIEF');
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-bold font-serif-kr transition-all ${
                      loginRole === 'EDITOR_IN_CHIEF'
                        ? 'bg-[#1b2a47] text-white border-[#1b2a47] shadow-xs'
                        : 'bg-[#f8f6f2] text-slate-700 border-[#d8d3cb]'
                    }`}
                  >
                    편집국장 (수석 데스크)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('REPORTER');
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-bold font-serif-kr transition-all ${
                      loginRole === 'REPORTER'
                        ? 'bg-[#1b2a47] text-white border-[#1b2a47] shadow-xs'
                        : 'bg-[#f8f6f2] text-slate-700 border-[#d8d3cb]'
                    }`}
                  >
                    소속 취재기자
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">이메일 계정</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="이메일 계정 입력"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">비밀번호</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#f5f1eb] rounded-xl border border-[#e2ded6] text-[11px] text-slate-600">
                <p className="font-bold text-slate-800 mb-0.5">💡 역할별 기본 기능 안내</p>
                <p>• <strong>편집국장:</strong> 기사 최종 승인/반려, 1면 톱 지정, 지면 편집, 기자/카테고리/댓글 총괄 관리</p>
                <p className="mt-1">• <strong>취재기자:</strong> 기사 송고(작성/임시저장), 승인 요청, 본인 기사 관리</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1b2a47] text-white font-bold rounded-xl hover:bg-[#25375c] transition-all shadow-sm"
              >
                {loginRole === 'EDITOR_IN_CHIEF' ? '편집국장 CMS 접속' : '기자 데스크 로그인'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs font-sans">
              {regSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>기자 등록이 완료되었습니다. 자동 로그인됩니다.</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">기자 실명 *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">소속 부서 *</label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                  >
                    <option value="문화부">문화부</option>
                    <option value="예술기획부">예술기획부</option>
                    <option value="문화유산부">문화유산부</option>
                    <option value="K-컬처부">K-컬처부</option>
                    <option value="논설위원실">논설위원실</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">직함 *</label>
                  <input
                    type="text"
                    required
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    placeholder="취재기자 / 전문위원"
                    className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">업무용 이메일 *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="reporter@kculturejournal.com"
                  className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">비밀번호 *</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="비밀번호 설정"
                  className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">기자 소개 (약력 / 출입처)</label>
                <input
                  type="text"
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="예: 국립현대미술관 및 예술의전당 출입"
                  className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1b2a47] text-white font-bold rounded-xl hover:bg-[#25375c] transition-all shadow-sm mt-2"
              >
                신규 기자 등록 및 즉시 로그인
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
