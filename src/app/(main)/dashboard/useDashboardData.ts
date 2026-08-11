import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useApi, useDateParameters, useLoginQuery, useUserWebsitesQuery } from '@/components/hooks';
import type { WebsiteStatsData } from '@/components/hooks/queries/useWebsiteStatsQuery';
import type { WebsitePageviewsData } from '@/components/hooks/queries/useWebsitePageviewsQuery';

const STAT_KEYS = ['pageviews', 'visitors', 'visits', 'bounces', 'totaltime'] as const;

export interface DashboardSite {
  website: { id: string; name: string; domain: string };
  stats: WebsiteStatsData;
  pageviews: WebsitePageviewsData;
}

function sumStats(list: any[]) {
  return STAT_KEYS.reduce((obj, key) => ({ ...obj, [key]: sum(list.map(n => n?.[key])) }), {}) as any;
}

function sum(values: number[]) {
  return values.reduce((total: number, n) => total + (+n || 0), 0);
}

function sumSeries(series: { x: string; y: number }[][]) {
  const totals = new Map<string, number>();

  series.flat().forEach(({ x, y }) => totals.set(x, (totals.get(x) || 0) + (+y || 0)));

  return Array.from(totals, ([x, y]) => ({ x, y })).sort((a, b) => a.x.localeCompare(b.x));
}

/**
 * Aggregates stats and pageview series across every website the user can see.
 * Visitor counts are summed per site, so a visitor on two sites counts twice.
 */
export function useDashboardData() {
  const { get } = useApi();
  const { user } = useLoginQuery();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const websitesQuery = useUserWebsitesQuery({ userId: user?.id }, { pageSize: 500 });
  const websites = websitesQuery.data?.data || [];

  const results = useQueries({
    queries: websites.map((website: any) => ({
      queryKey: ['dashboard:website', { websiteId: website.id, startAt, endAt, unit, timezone }],
      queryFn: async (): Promise<DashboardSite> => {
        const params = { startAt, endAt, unit, timezone };
        const [stats, pageviews] = await Promise.all([
          get(`/websites/${website.id}/stats`, params),
          get(`/websites/${website.id}/pageviews`, params),
        ]);

        return { website, stats, pageviews };
      },
    })),
  });

  const sites = results.map(r => r.data).filter(Boolean) as DashboardSite[];
  const isLoading = websitesQuery.isLoading || results.some(r => r.isLoading);
  const error = websitesQuery.error || results.find(r => r.error)?.error;

  const data = useMemo(() => {
    if (!sites.length) return null;

    return {
      stats: {
        ...sumStats(sites.map(s => s.stats)),
        comparison: sumStats(sites.map(s => s.stats?.comparison)),
      } as WebsiteStatsData,
      chart: {
        pageviews: sumSeries(sites.map(s => s.pageviews?.pageviews || [])),
        sessions: sumSeries(sites.map(s => s.pageviews?.sessions || [])),
      },
      sites: [...sites].sort((a, b) => b.stats.pageviews - a.stats.pageviews),
    };
  }, [results.map(r => r.dataUpdatedAt).join()]);

  return { data, isLoading, error, count: websites.length };
}
