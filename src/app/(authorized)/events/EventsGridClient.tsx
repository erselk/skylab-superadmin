'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EventDto } from '@/types/api';

interface EventsGridClientProps {
  events: EventDto[];
  eventTypeOrder: string[];
}

const DEFAULT_GROUP = 'Diğer';

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export function EventsGridClient({ events, eventTypeOrder }: EventsGridClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedOrder = useMemo(() => {
    const order = Array.from(new Set(eventTypeOrder.filter(Boolean)));
    if (!order.includes(DEFAULT_GROUP)) {
      order.push(DEFAULT_GROUP);
    }
    return order;
  }, [eventTypeOrder]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      const name = event.name?.toLowerCase() ?? '';
      const location = event.location?.toLowerCase() ?? '';
      const typeName = event.type?.name?.toLowerCase() ?? '';
      return name.includes(query) || location.includes(query) || typeName.includes(query);
    });
  }, [events, searchQuery]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, EventDto[]> = {};
    normalizedOrder.forEach((key) => {
      groups[key] = [];
    });

    filteredEvents.forEach((event) => {
      const key = event.type?.name || DEFAULT_GROUP;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
    });

    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key].sort((a, b) => {
        const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
        return aTime - bTime;
      });
    });

    return groups;
  }, [filteredEvents, normalizedOrder]);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Etkinlik ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-4 py-2 pl-10 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
          />
          <svg
            className="text-dark-400 absolute top-2.5 left-3 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-dark-400 hover:text-dark-600 absolute top-2.5 right-3"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {normalizedOrder.map((group) => {
          const items = groupedEvents[group] || [];

          return (
            <div key={group} className="space-y-2">
              <div>
                <h2 className="text-dark-900 mb-1 text-sm font-semibold">{group}</h2>
                <div className="border-dark-200 border-b" />
              </div>
              <div className="space-y-1.5">
                {items.length === 0 ? (
                  <p className="text-dark-400 text-xs">Etkinlik yok</p>
                ) : (
                  items.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => router.push(`/events/${event.id}`)}
                      className="bg-light border-dark-200 hover:bg-brand-50 hover:border-brand group cursor-pointer rounded-md border px-2 py-1.5 transition-all"
                    >
                      <div className="text-dark-900 pr-8 text-xs font-medium" title={event.name}>
                        {event.name}
                      </div>
                      <div className="text-dark-500 mt-0.5 text-[10px]">
                        {formatDateTime(event.startDate)}
                      </div>
                      <div className="text-dark-400 mt-0.5 line-clamp-1 text-[10px]">
                        {event.location || 'Konum belirtilmemiş'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
