import React, { useState } from 'react';
import { Lock, User, Key, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AdminLoginModalProps {
  onClose: () => void;
  onLoginSuccess: (adminName: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Strictly authenticated credentials for Editor-in-Chief
      if (username.trim() === 'soobakmu@naver.com' && password === 'soobakone1#') {
        onLoginSuccess('편집국장 (수석 데스크)');
        onClose();
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#fcfaf7] border border-[#d8d3cb] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-[#1b2a47] text-white flex items-center justify-between border-b border-[#2d3e5f]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-kr text-base font-bold">한국문화저널 편집국 CMS</h3>
              <p className="text-[11px] text-slate-300 font-sans">
                기자단 및 편집 데스크 전용 관리자 로그인
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
              관리자 계정 ID (이메일)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디 또는 이메일 입력"
                className="w-full pl-9 pr-3 py-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-xs font-sans text-slate-900 focus:outline-none focus:border-[#1b2a47]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
              비밀번호
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full pl-9 pr-3 py-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-xs font-sans text-slate-900 focus:outline-none focus:border-[#1b2a47]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1b2a47] text-white text-xs font-bold rounded-xl hover:bg-[#25375c] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? '인증 처리 중...' : '편집국 관리자 로그인'}
          </button>
        </form>
      </div>
    </div>
  );
};
