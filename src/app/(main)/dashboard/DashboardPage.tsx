'use client';
import Link from 'next/link';
import { Column, Row, DataTable, DataColumn } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { PageBody } from '@/components/common/PageBody';
import { Panel } from '@/components/common/Panel';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { PageviewsChart } from '@/components/metrics/PageviewsChart';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { useDateRange, useMessages, useNavigation, useTimezone } from '@/components/hooks';
import { formatLongNumber, formatShortTime } from '@/lib/format';
import { useDashboardData } from './useDashboardData';

export function DashboardPage() {
  const { formatMessage, labels } = useMessages();
  const { timezone } = useTimezone();
  const { dateRange, isAllTime } = useDateRange({ timezone });
  const { startDate, endDate, unit, value } = dateRange;
  const { renderUrl } = useNavigation();
  const { data, isLoading, error } = useDashboardData();

  const { pageviews, visitors, visits, bounces, totaltime, comparison } = data?.stats || ({} as any);

  const metrics = data
    ? [
        {
          label: formatMessage(labels.visitors),
          value: visitors,
          change: visitors - comparison.visitors,
          formatValue: formatLongNumber,
        },
        {
          label: formatMessage(labels.visits),
          value: visits,
          change: visits - comparison.visits,
          formatValue: formatLongNumber,
        },
        {
          label: formatMessage(labels.views),
          value: pageviews,
          change: pageviews - comparison.pageviews,
          formatValue: formatLongNumber,
        },
        {
          label: formatMessage(labels.bounceRate),
          value: (Math.min(visits, bounces) / visits) * 100,
          change:
            (Math.min(visits, bounces) / visits) * 100 -
            (Math.min(comparison.visits, comparison.bounces) / comparison.visits) * 100,
          formatValue: (n: any) => Math.round(+n) + '%',
          reverseColors: true,
        },
        {
          label: formatMessage(labels.visitDuration),
          value: totaltime / visits,
          change: totaltime / visits - comparison.totaltime / comparison.visits,
          formatValue: (n: any) =>
            `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`,
        },
      ]
    : null;

  return (
    <PageBody>
      <Column gap margin="2">
        <PageHeader title={formatMessage(labels.dashboard)}>
          <Row alignItems="center" gap>
            <WebsiteDateFilter websiteId={data?.sites[0]?.website?.id} showAllTime={false} />
          </Row>
        </PageHeader>
        <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="136px">
          <Column gap>
            <MetricsBar>
              {metrics?.map(({ label, value, change, formatValue, reverseColors }) => (
                <MetricCard
                  key={label}
                  label={label}
                  value={value}
                  change={change}
                  formatValue={formatValue}
                  reverseColors={reverseColors}
                  showChange={!isAllTime}
                />
              ))}
            </MetricsBar>
            <Panel minHeight="520px">
              <PageviewsChart
                key={value}
                data={data?.chart}
                minDate={startDate}
                maxDate={endDate}
                unit={unit}
              />
            </Panel>
            <Panel title={formatMessage(labels.websites)}>
              <DataTable data={data?.sites}>
                <DataColumn id="name" label={formatMessage(labels.name)}>
                  {({ website }: any) => (
                    <Link href={renderUrl(`/websites/${website.id}`, false)}>{website.name}</Link>
                  )}
                </DataColumn>
                <DataColumn id="visitors" label={formatMessage(labels.visitors)} align="end">
                  {({ stats }: any) => formatLongNumber(stats.visitors)}
                </DataColumn>
                <DataColumn id="pageviews" label={formatMessage(labels.views)} align="end">
                  {({ stats }: any) => formatLongNumber(stats.pageviews)}
                </DataColumn>
                <DataColumn id="change" label={formatMessage(labels.change)} align="end">
                  {({ stats }: any) => {
                    const prev = stats.comparison?.pageviews;
                    const pct = prev ? ((stats.pageviews - prev) / prev) * 100 : 0;

                    return (
                      <ChangeLabel value={pct}>{`${Math.abs(Math.round(pct))}%`}</ChangeLabel>
                    );
                  }}
                </DataColumn>
              </DataTable>
            </Panel>
          </Column>
        </LoadingPanel>
      </Column>
    </PageBody>
  );
}
