import React, { useState } from 'react';
import { X, Calendar, MapPin, Ticket, Filter, ExternalLink, Bookmark } from 'lucide-react';
import { CULTURAL_EVENTS } from '../data/mockNews';
import { CulturalEvent } from '../types';

interface CultureCalendarModalProps {
  events?: CulturalEvent[];
  onClose: () => void;
}

export const CultureCalendarModal: React.FC<CultureCalendarModalProps> = ({ events = CULTURAL_EVENTS, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());

  const currentEvents = events && events.length > 0 ? events : CULTURAL_EVENTS;

  const categories = [
    { id: 'all', label: '전체 일정' },
    { id: '전시', label: '미술·박물관 전시' },
    { id: '공연', label: '국악·클래식·연극' },
    { id: '고궁야간', label: '고궁 야간관람' },
    { id: '축제', label: '전통 축제·체험' },
  ];

  const filteredEvents = currentEvents.filter((ev) => {
    if (selectedFilter === 'all') return true;
    return ev.category === selectedFilter;
  });

  const toggleSave = (id: string) => {
    setSavedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in flex flex-col max-h-[90vh] font-sans">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-serif-kr">
                대한민국 문화·전시·공연 캘린더
              </h2>
              <p className="text-xs text-gray-500">
                한국문화저널 문화부가 검증한 이달의 주요 헤리티지 및 예술 행사
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

        {/* Filter Pills */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-gray-400 mr-1 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                selectedFilter === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filteredEvents.map((event) => {
            const isSaved = savedEvents.has(event.id);
            return (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all bg-white"
              >
                <img
                  src={event.imageUrl || 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=600&q=80'}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-36 h-28 rounded-lg object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xs">
                      {event.category}
                    </span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-xs">
                      {event.dDay || 'D-Day'}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      상태: {event.status || '진행중'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug mb-1 font-serif-kr">
                    {event.title}
                  </h3>

                  <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{event.place}</span>
                  </p>

                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{event.period}</span>
                  </p>
                </div>

                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => toggleSave(event.id)}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                      isSaved
                        ? 'bg-amber-50 text-amber-600 border-amber-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    <span className="sm:hidden">{isSaved ? '저장됨' : '저장'}</span>
                  </button>
                  <button
                    onClick={() => alert(`[예매/상세 안내]\n${event.title}\n공식 문화포털 예매처로 연결됩니다.`)}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>예매/상세</span>
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
