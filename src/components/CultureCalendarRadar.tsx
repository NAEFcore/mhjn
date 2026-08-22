import React from 'react';
import { Calendar, MapPin, Ticket, ChevronRight, ExternalLink } from 'lucide-react';
import { CULTURAL_EVENTS } from '../data/mockNews';
import { CulturalEvent } from '../types';

interface CultureCalendarRadarProps {
  events?: CulturalEvent[];
  onOpenFullCalendar: () => void;
  onSelectEvent?: (event: CulturalEvent) => void;
}

export const CultureCalendarRadar: React.FC<CultureCalendarRadarProps> = ({
  events = CULTURAL_EVENTS,
  onOpenFullCalendar,
  onSelectEvent,
}) => {
  const displayEvents = events && events.length > 0 ? events : CULTURAL_EVENTS;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-base font-serif-kr">
            오늘의 문화 레이더
          </h3>
        </div>
        <button
          onClick={onOpenFullCalendar}
          className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
        >
          전체일정 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {displayEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => onSelectEvent?.(event) || onOpenFullCalendar()}
            className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 cursor-pointer transition-all group"
          >
            <img
              src={event.imageUrl || 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=600&q=80'}
              alt={event.title}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-md object-cover bg-gray-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-xs">
                  {event.category}
                </span>
                <span className="px-1.5 py-0.2 bg-red-50 text-red-600 text-[10px] font-bold rounded-xs">
                  {event.dDay || 'D-Day'}
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  {event.status || '진행중'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-800 line-clamp-1 leading-snug font-serif-kr">
                {event.title}
              </h4>
              <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1 truncate font-sans">
                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                <span>{event.place}</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 font-sans">
                {event.period}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
