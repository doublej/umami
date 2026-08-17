import { Column, Grid, Row } from '@umami/react-zen';
import { useShare } from '@/components/hooks';
import { ExportButton } from '@/components/input/ExportButton';
import { FilterBar } from '@/components/input/FilterBar';
import { MonthFilter } from '@/components/input/MonthFilter';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { WebsiteFilterButton } from '@/components/input/WebsiteFilterButton';
import { allowShareFilter } from '@/lib/share';

export function PixelControls({
  pixelId: websiteId,
  allowFilter = true,
  allowDateFilter = true,
  allowMonthFilter,
  allowDownload = false,
}: {
  pixelId: string;
  allowFilter?: boolean;
  allowDateFilter?: boolean;
  allowMonthFilter?: boolean;
  allowDownload?: boolean;
}) {
  const share = useShare();
  const showFilter = allowFilter && allowShareFilter(share?.parameters);

  return (
    <Column gap>
      <Grid columns={{ base: '1fr', md: 'auto 1fr' }} gap>
        <Row alignItems="center" justifyContent="flex-start">
          {showFilter ? <WebsiteFilterButton websiteId={websiteId} /> : <div />}
        </Row>
        <Row alignItems="center" justifyContent={{ base: 'flex-start', md: 'flex-end' }} gap>
          {allowDateFilter && <WebsiteDateFilter websiteId={websiteId} showAllTime={false} />}
          {allowDownload && <ExportButton websiteId={websiteId} />}
          {allowMonthFilter && <MonthFilter />}
        </Row>
      </Grid>
      {showFilter && <FilterBar websiteId={websiteId} />}
    </Column>
  );
}
