import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { CalendarEvent } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Calendar as CalendarIcon,
  Clock,
  Filter,
  CheckCircle2,
  Video,
  ClipboardList,
  Building2,
  FolderGit2
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const events = StorageService.getCalendarEvents();

  const filteredEvents = events.filter(e => {
    return selectedCategory === 'all' || e.category === selectedCategory;
  });

  // Sort chronologically
  filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span>Unified Academic & Recruitment Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized schedule for assignment deadlines, interviews, midterms, placement drives, and capstone reviews.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'assignment', 'interview', 'placement', 'exam', 'project'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Agenda Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Upcoming Schedule Agenda ({filteredEvents.length} Events)
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {filteredEvents.map(event => {
            const dateObj = new Date(event.date);
            const isToday = event.date === new Date().toISOString().split('T')[0];

            return (
              <div key={event.id} className="relative group">
                <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {event.time && (
                        <span className="text-xs font-mono text-slate-500">
                          at {event.time}
                        </span>
                      )}
                      {isToday && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase">
                          Today
                        </span>
                      )}
                    </div>

                    <StatusBadge status={event.category} size="sm" />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{event.title}</h4>
                  {event.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
