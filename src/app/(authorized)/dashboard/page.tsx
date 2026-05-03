import { cookies } from 'next/headers';

import { PageHeader } from '@/components/layout/PageHeader';
import { getUsers } from '../users/actions';
import { getEvents } from '../events/actions';
import { getAnnouncements } from '../announcements/actions';
import { getSessions } from '../sessions/actions';
import Link from 'next/link';
import { serverFetch } from '@/lib/api/server-client';
import { enrichUserRolesFromAccessToken } from '@/lib/auth/jwt-payload';
import { getTokenFromCookies } from '@/lib/auth/token';
import { filterSidebarNavForUser } from '@/lib/navigation/sidebar-nav';
import {
  canOperateEventScheduling,
  eventTypeMatchesLeaderScope,
  getLeaderEventType,
} from '@/lib/utils/permissions';

export const revalidate = 60;
import type {
  AnnouncementDto,
  EventDto,
  SessionDto,
  UserDto,
  DataResultUserDto,
} from '@/types/api';

const ROLE_PRIORITY = [
  'ADMIN',
  'SUPER_ADMIN',
  'USER_MANAGER',
  'YK',
  'DK',
  'AGC_ADMIN',
  'AGC_LEADER',
  'GECEKODU_ADMIN',
  'GECEKODU_LEADER',
  'BIZBIZE_ADMIN',
  'BIZBIZE_LEADER',
  'USER',
];

const getPrimaryRole = (roles: string[] = []) => {
  if (roles.length === 0) return 'Rol atanmamış';

  const getScore = (role: string) => {
    const index = ROLE_PRIORITY.indexOf(role);
    return index === -1 ? ROLE_PRIORITY.length : index;
  };

  return [...roles].sort((a, b) => {
    const diff = getScore(a) - getScore(b);
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  })[0];
};

export default async function DashboardPage() {
  let usersCount = 0;
  let eventsCount = 0;
  let announcementsCount = 0;
  let sessionsCount = 0;
  let backendError = false;

  let usersList: UserDto[] = [];
  let announcementsList: AnnouncementDto[] = [];
  let sessionsList: SessionDto[] = [];
  let eventsList: EventDto[] = [];

  let currentUser: UserDto | null = null;
  let navHrefsForDashboard = new Set<string>();
  let showNewEventShortcut = false;

  try {
    // Fetch current user first to determine permissions
    const userResult = await serverFetch<DataResultUserDto>('/api/users/me');
    const cookieStore = await cookies();
    const token = getTokenFromCookies(cookieStore);

    /** Layout ile aynı: roller çoğu zaman JWT’de — sidebar/dashboard sapmasın */
    currentUser =
      userResult.data != null ? enrichUserRolesFromAccessToken(userResult.data, token) : null;

    const leaderScope = currentUser ? getLeaderEventType(currentUser) : null;

    if (currentUser) {
      navHrefsForDashboard = new Set(filterSidebarNavForUser(currentUser).map((l) => l.href));
      showNewEventShortcut = canOperateEventScheduling(currentUser);
    }

    const promises = [];
    /** Menüde Etkinlikler yoksa (USER / rolsüz): etkinlik & oturum özetleri yok */
    const dashboardShowsEventSlices = currentUser !== null && navHrefsForDashboard.has('/events');

    if (currentUser && navHrefsForDashboard.has('/users')) {
      promises.push(getUsers().then((res) => ({ type: 'users', res })));
    } else {
      promises.push(Promise.resolve({ type: 'users', res: [] }));
    }

    if (dashboardShowsEventSlices) {
      promises.push(getEvents().then((res) => ({ type: 'events', res })));
    } else {
      promises.push(Promise.resolve({ type: 'events', res: [] }));
    }

    if (currentUser && navHrefsForDashboard.has('/announcements')) {
      promises.push(
        getAnnouncements({ includeUser: true }).then((res) => ({ type: 'announcements', res })),
      );
    } else {
      promises.push(Promise.resolve({ type: 'announcements', res: [] }));
    }

    if (dashboardShowsEventSlices) {
      promises.push(getSessions().then((res) => ({ type: 'sessions', res })));
    } else {
      promises.push(Promise.resolve({ type: 'sessions', res: [] }));
    }

    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { type, res } = result.value;

        if (type === 'users') {
          usersList = Array.isArray(res) ? (res as UserDto[]) : [];
          usersCount = usersList.length;
        } else if (type === 'events') {
          const events = Array.isArray(res) ? (res as EventDto[]) : [];
          eventsList = events;
          eventsCount = events.length;
        } else if (type === 'announcements') {
          let announcements = Array.isArray(res) ? (res as AnnouncementDto[]) : [];
          if (leaderScope) {
            announcements = announcements.filter((a) => {
              const tag = a.eventType?.name;
              if (!tag) return true;
              return eventTypeMatchesLeaderScope(tag, leaderScope);
            });
          }
          announcementsList = announcements;
          announcementsCount = announcementsList.length;
        } else if (type === 'sessions') {
          const sessions = Array.isArray(res) ? (res as SessionDto[]) : [];
          sessionsList = sessions;
          sessionsCount = sessions.length;
        }
      } else {
        console.error('Dashboard fetch error:', result.reason);

        if (
          result.reason?.message?.includes('502') ||
          result.reason?.message?.includes('Backend servisi')
        ) {
          backendError = true;
        }
      }
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    if (
      error instanceof Error &&
      (error.message.includes('502') || error.message.includes('Backend servisi'))
    ) {
      backendError = true;
    }
  }

  const recentUsers = usersList.slice(0, 4);
  /** Tarihi olanlar önce yakın sırayla; tarih yok/geçersizse sonda kalır — 4 gösterime filtre yüzünden düşmez */
  const upcomingSessions = [...sessionsList]
    .sort((a, b) => {
      const ts = (s: SessionDto) => {
        if (!s.startTime) return Number.POSITIVE_INFINITY;
        const n = new Date(s.startTime).getTime();
        return Number.isNaN(n) ? Number.POSITIVE_INFINITY : n;
      };
      return ts(a) - ts(b);
    })
    .slice(0, 4);

  const latestAnnouncements = announcementsList.slice(0, 3);

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const statsCards = [
    {
      title: 'Toplam Kullanıcı',
      value: usersCount,
      href: '/users',
      icon: (
        <svg
          className="h-5 w-5 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 6a4 4 0 110 8 4 4 0 010-8zm6 12v-1a4 4 0 00-4-4H10a4 4 0 00-4 4v1"
          />
        </svg>
      ),
      permission: 'users',
    },

    {
      title: 'Etkinlikler',
      value: eventsCount,
      href: '/events',
      icon: (
        <svg
          className="h-5 w-5 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7V3m8 4V3M5 11h14M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"
          />
        </svg>
      ),
      displayClass: 'hidden sm:block',
      permission: 'events',
    },
    {
      title: 'Duyurular',
      value: announcementsCount,
      href: '/announcements',
      icon: (
        <svg
          className="h-5 w-5 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      displayClass: 'hidden md:block',
      permission: 'announcements',
    },
    {
      title: 'Oturumlar',
      value: sessionsCount,
      icon: (
        <svg
          className="h-5 w-5 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      displayClass: 'hidden lg:block',
      permission: 'sessions',
    },
  ];

  const dashShowUsersSection = navHrefsForDashboard.has('/users');
  const dashShowAnnouncementsSection = navHrefsForDashboard.has('/announcements');
  const dashHasLeftColumn = dashShowUsersSection || dashShowAnnouncementsSection;
  const dashShowSessionsSection = navHrefsForDashboard.has('/events');
  const dashShowQuickAnnounceLink = navHrefsForDashboard.has('/announcements');
  const dashShowQuickActions = showNewEventShortcut || dashShowQuickAnnounceLink;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Genel durumu, yaklaşan oturumları ve ekip aktivitelerini tek ekrandan takip edin"
      />

      {backendError && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-900">Backend Servisi Erişilemiyor</p>
              <p className="text-sm text-amber-700">
                Backend servisi şu anda erişilemiyor. Kartlarda görülen veriler güncel olmayabilir.
                Lütfen daha sonra tekrar deneyin.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
        {statsCards
          .filter((card) => {
            switch (card.permission) {
              case 'users':
                return navHrefsForDashboard.has('/users');
              case 'announcements':
                return navHrefsForDashboard.has('/announcements');
              case 'events':
                return navHrefsForDashboard.has('/events');
              case 'sessions':
                return navHrefsForDashboard.has('/events');
              default:
                return false;
            }
          })
          .map((card) => {
            const linked = 'href' in card && typeof card.href === 'string';
            const cardClass = [
              'border-dark-200 bg-light min-w-[150px] flex-1 rounded-lg border p-4 transition-colors duration-150 sm:min-w-[180px]',
              card.displayClass ?? '',
              linked
                ? 'hover:border-brand/70 hover:shadow-sm focus-visible:border-brand cursor-pointer focus-visible:outline-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                : 'hover:border-dark-300/70',
            ]
              .filter(Boolean)
              .join(' ');
            const body = (
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <span className="text-dark-500 text-xs font-medium tracking-wide uppercase sm:text-sm sm:tracking-normal sm:normal-case">
                  {card.title}
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-dark-900 text-xl font-semibold sm:text-2xl">
                    {card.value}
                  </span>
                  {card.icon}
                </div>
              </div>
            );
            if (linked) {
              return (
                <Link key={card.title} href={card.href} className={cardClass}>
                  {body}
                </Link>
              );
            }
            return (
              <div key={card.title} className={cardClass} role="group">
                {body}
              </div>
            );
          })}
      </div>

      <div
        className={
          dashHasLeftColumn
            ? 'grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_minmax(0,1fr)] xl:items-start'
            : 'grid grid-cols-1 gap-5'
        }
      >
        {dashHasLeftColumn ? (
          <div className="min-w-0 space-y-5">
            {navHrefsForDashboard.has('/users') && (
              <section className="border-dark-200 bg-light rounded-xl border p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-dark-900 text-lg font-semibold">Son Kullanıcılar</h2>
                    <p className="text-dark-500 text-sm">
                      Kullanıcılar ekranındaki en güncel kayıtlar
                    </p>
                  </div>
                  <Link
                    href="/users"
                    className="text-brand text-sm font-medium transition hover:opacity-80"
                  >
                    Tümünü Gör
                  </Link>
                </div>
                <div className="mt-4 space-y-2.5">
                  {recentUsers.length === 0 ? (
                    <div className="border-dark-200/70 text-dark-500 rounded-lg border border-dashed p-5 text-center text-sm">
                      Henüz kullanıcı verisi bulunmuyor.
                    </div>
                  ) : (
                    recentUsers.map((user) => {
                      const fullName =
                        `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username;
                      const primaryRole = getPrimaryRole(user.roles || []);

                      return (
                        <Link
                          key={user.id}
                          href={`/users/${user.id}`}
                          className="hover:border-brand/60 hover:bg-brand-50/40 flex items-center gap-4 rounded-lg border border-transparent bg-white/60 p-3 transition"
                        >
                          <div className="bg-brand-100 text-brand-600 flex h-12 w-12 items-center justify-center rounded-full">
                            <span className="text-sm font-semibold">
                              {fullName ? fullName[0] : '?'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-dark-900 text-sm font-semibold">{fullName}</p>
                            <p className="text-dark-500 text-xs">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="border-brand-200 bg-brand-50 text-brand-600 rounded-full border px-3 py-1 text-xs font-medium">
                              {primaryRole}
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </section>
            )}

            {navHrefsForDashboard.has('/announcements') && (
              <section className="border-dark-200 bg-light rounded-xl border p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-dark-900 text-lg font-semibold">Duyuru Panosu</h2>
                    <p className="text-dark-500 text-sm">
                      Aktif duyuruların hızlı özetini inceleyin
                    </p>
                  </div>
                  <Link
                    href="/announcements"
                    className="text-brand text-sm font-medium transition hover:opacity-80"
                  >
                    Yönet
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {latestAnnouncements.length === 0 ? (
                    <div className="border-dark-200/70 text-dark-500 rounded-lg border border-dashed p-5 text-center text-sm">
                      Yayınlanmış duyuru bulunamadı.
                    </div>
                  ) : (
                    latestAnnouncements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="border-dark-200 rounded-lg border bg-white/60 p-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-dark-900 text-sm font-semibold">
                              {announcement.title}
                            </p>
                            <p className="text-dark-500 line-clamp-1 text-xs">
                              {announcement.body}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              announcement.active
                                ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
                                : 'bg-dark-100 text-dark-500 border-dark-200 border'
                            }`}
                          >
                            {announcement.active ? 'Aktif' : 'Taslak'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
        ) : null}

        {dashShowSessionsSection ? (
          <section
            className={`border-dark-200 bg-light rounded-xl border p-5 shadow-sm xl:min-h-0 xl:w-full ${
              dashHasLeftColumn
                ? 'xl:sticky xl:top-6 xl:max-h-[min(70rem,calc(100vh-8rem))] xl:overflow-x-hidden xl:overflow-y-auto'
                : ''
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-dark-900 text-lg font-semibold">Yaklaşan Oturumlar</h2>
                <p className="text-dark-500 text-sm">Başlangıç tarihine göre sıradaki oturumlar</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingSessions.length === 0 ? (
                <div className="border-dark-200/70 text-dark-500 rounded-lg border border-dashed p-5 text-center text-sm">
                  Planlanmış oturum bulunmuyor.
                </div>
              ) : (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border-dark-200 hover:border-brand/40 hover:bg-brand-50/30 flex flex-col gap-2.5 rounded-lg border bg-white/80 p-3.5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-dark-900 truncate text-sm font-semibold">
                          {session.title}
                        </p>
                        <p className="text-dark-500 text-xs">
                          {session.speakerName ?? 'Konuşmacı belirlenmedi'}
                        </p>
                      </div>
                      {session.sessionType && (
                        <span className="border-dark-200/70 bg-dark-100 text-dark-600 rounded-full border px-3 py-1 text-[11px] font-medium">
                          {session.sessionType}
                        </span>
                      )}
                    </div>
                    <div className="text-dark-500 flex flex-wrap items-center gap-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <svg
                          className="text-brand h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatDateTime(session.startTime)}
                        {session.endTime && ` • ${formatDateTime(session.endTime)}`}
                      </div>
                      {session.event?.name && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="text-dark-400 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M3 9l9-7 9 7-9 7-9-7zm0 6l9 7 9-7"
                            />
                          </svg>
                          {session.event.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}
      </div>

      {dashShowQuickActions ? (
        <section className="border-dark-200 bg-light rounded-xl border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-dark-900 text-lg font-semibold">Hızlı İşlemler</h2>
              <p className="text-dark-500 text-sm">Sık kullanılan modüllere doğrudan erişin</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex flex-1 justify-stretch sm:justify-end">
              {showNewEventShortcut ? (
                <Link
                  href="/events/new"
                  className="border-dark-200 hover:border-brand/60 hover:bg-brand-50/40 flex w-full max-w-full flex-col gap-1.5 rounded-lg border bg-white/60 p-4 transition sm:max-w-sm"
                >
                  <span className="text-dark-900 text-sm font-semibold">Etkinlik Oluştur</span>
                  <span className="text-dark-500 text-xs">Takviminizi güncel tutun</span>
                </Link>
              ) : (
                <div
                  className="hidden flex-1 sm:block sm:min-h-[4.75rem] sm:max-w-sm"
                  aria-hidden
                />
              )}
            </div>

            <div className="flex shrink-0 items-center justify-center px-4 py-2">
              <img
                src="/logoyatay.png"
                alt="Skylab"
                className="h-14 w-auto max-w-[280px] object-contain brightness-0 sm:h-16 sm:max-w-[340px] lg:h-[4.5rem] lg:max-w-[400px]"
              />
            </div>

            <div className="flex flex-1 justify-stretch sm:justify-start">
              {dashShowQuickAnnounceLink ? (
                <Link
                  href="/announcements/new"
                  className="border-dark-200 hover:border-brand/60 hover:bg-brand-50/40 flex w-full max-w-full flex-col gap-1.5 rounded-lg border bg-white/60 p-4 transition sm:max-w-sm"
                >
                  <span className="text-dark-900 text-sm font-semibold">Duyuru Ekle</span>
                  <span className="text-dark-500 text-xs">Topluluğa yeni duyuru paylaşın</span>
                </Link>
              ) : (
                <div
                  className="hidden flex-1 sm:block sm:min-h-[4.75rem] sm:max-w-sm"
                  aria-hidden
                />
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
