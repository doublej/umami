'use client';
import { Column, DataColumn, DataTable, Row } from '@umami/react-zen';
import Link from '@/components/common/Link';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useDateRange, useMessages, useNavigation, useTimezone } from '@/components/hooks';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { PageviewsChart } from '@/components/metrics/PageviewsChart';
import { formatLongNumber, formatShortTime } from '@/lib/format';
import { useOverviewData } from './useOverviewData';

export function OverviewPage() {
  const { t, labels } = useMessages();
  const { timezone } = useTimezone();
  const { dateRange, isAllTime } = useDateRange({ timezone });
  const { startDate, endDate, unit, value } = dateRange;
  const { renderUrl } = useNavigation();
  const { data, isLoading, error } = useOverviewData();

  const { pageviews, visitors, visits, bounces, totaltime, comparison } =
    data?.stats || ({} as any);

  const metrics = data
    ? [
        {
          label: t(labels.visitors),
          value: visitors,
          change: visitors - comparison.visitors,
          formatValue: formatLongNumber,
        },
        {
          label: t(labels.visits),
          value: visits,
          change: visits - comparison.visits,
          formatValue: formatLongNumber,
        },
        {
          label: t(labels.views),
          value: pageviews,
          change: pageviews - comparison.pageviews,
          formatValue: formatLongNumber,
        },
        {
          label: t(labels.bounceRate),
          value: (Math.min(visits, bounces) / visits) * 100,
          change:
            (Math.min(visits, bounces) / visits) * 100 -
            (Math.min(comparison.visits, comparison.bounces) / comparison.visits) * 100,
          formatValue: (n: any) => `${Math.round(+n)}%`,
          reverseColors: true,
        },
        {
          label: t(labels.visitDuration),
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
        <PageHeader title={t(labels.overview)}>
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
            <Panel title={t(labels.websites)}>
              <DataTable data={data?.sites}>
                <DataColumn id="name" label={t(labels.name)}>
                  {({ website }: any) => (
                    <Link href={renderUrl(`/websites/${website.id}`, false)}>{website.name}</Link>
                  )}
                </DataColumn>
                <DataColumn id="visitors" label={t(labels.visitors)} align="end">
                  {({ stats }: any) => formatLongNumber(stats.visitors)}
                </DataColumn>
                <DataColumn id="pageviews" label={t(labels.views)} align="end">
                  {({ stats }: any) => formatLongNumber(stats.pageviews)}
                </DataColumn>
                <DataColumn id="change" label={t(labels.growth)} align="end">
                  {({ stats }: any) => {
                    const prev = stats.comparison?.pageviews;
                    const pct = prev ? ((stats.pageviews - prev) / prev) * 100 : 0;

                    return <ChangeLabel value={pct}>{`${Math.abs(Math.round(pct))}%`}</ChangeLabel>;
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
