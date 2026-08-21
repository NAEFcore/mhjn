import React from 'react';
import { X, Users, Mail, Plus, UserCheck, Heart, Award, BookOpen } from 'lucide-react';
import { REPORTERS } from '../data/mockNews';
import { Reporter } from '../types';

interface ReportersDeskModalProps {
  onClose: () => void;
  onSelectReporterArticles?: (reporter: Reporter) => void;
  subscribedReporters: Set<string>;
  onToggleSubscribeReporter: (id: string) => void;
}

export const ReportersDeskModal: React.FC<ReportersDeskModalProps> = ({
  onClose,
  onSelectReporterArticles,
  subscribedReporters,
  onToggleSubscribeReporter,
}) => {
  const reporterList = Object.values(REPORTERS);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-serif-kr">
                한국문화저널 기자 홈 · 문화부 데스크
              </h2>
              <p className="text-xs text-gray-500">
                대한민국 문화예술 현장을 발로 뛰는 전문 기자들의 시각과 연재를 구독하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reporters Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 bg-gray-50">
          {reporterList.map((reporter) => {
            const isSubscribed = subscribedReporters.has(reporter.id);

            return (
              <div
                key={reporter.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start gap-4 mb-3">
                    <img
                      src={reporter.avatar}
                      alt={reporter.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#0051a8]/20 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">{reporter.name} 기자</h3>
                        <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                          {reporter.department}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium mt-0.5">{reporter.title}</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        <span>{reporter.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                    "{reporter.bio}"
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-3 text-gray-500 font-medium">
                    <span>구독자 {((reporter.subscriberCount + (isSubscribed ? 1 : 0)) / 10000).toFixed(1)}만</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-red-600 font-semibold">
                      <Heart className="w-3 h-3 fill-current" />
                      {reporter.cheerCount}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleSubscribeReporter(reporter.id)}
                    className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 transition-all ${
                      isSubscribed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-[#0051a8] text-white hover:bg-[#003870] shadow-xs'
                    }`}
                  >
                    {isSubscribed ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>구독중</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>기자 구독</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
