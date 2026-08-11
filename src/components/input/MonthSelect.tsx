import { Button, Icon, Row, Select, ListItem } from '@umami/react-zen';
import { addMonths } from 'date-fns';
import { ChevronRight } from '@/components/icons';
import { useLocale } from '@/components/hooks';
import { formatDate } from '@/lib/date';

export function MonthSelect({ date = new Date(), onChange }) {
  const { locale } = useLocale();
  const month = date.getMonth();
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();

  const months = [...Array(12)].map((_, i) => i);
  const years = [...Array(10)].map((_, i) => currentYear - i);
  const disableForward = year === currentYear && month >= new Date().getMonth();

  const handleMonthChange = (month: number) => {
    const d = new Date(date);
    d.setMonth(month);
    onChange?.(d);
  };
  const handleYearChange = (year: number) => {
    const d = new Date(date);
    d.setFullYear(year);
    onChange?.(d);
  };
  const handleIncrement = (increment: number) => {
    onChange?.(addMonths(date, increment));
  };

  return (
    <Row wrap="wrap" gap>
      <Row gap="1">
        <Button onPress={() => handleIncrement(-1)} variant="outline">
          <Icon rotate={180}>
            <ChevronRight />
          </Icon>
        </Button>
        <Button onPress={() => handleIncrement(1)} variant="outline" isDisabled={disableForward}>
          <Icon>
            <ChevronRight />
          </Icon>
        </Button>
      </Row>
      <Row minWidth="140px">
        <Select value={month} onChange={handleMonthChange}>
          {months.map(m => {
            return (
              <ListItem id={m} key={m}>
                {formatDate(new Date(year, m, 1), 'MMMM', locale)}
              </ListItem>
            );
          })}
        </Select>
      </Row>
      <Row minWidth="100px">
        <Select value={year} onChange={handleYearChange}>
          {years.map(y => {
            return (
              <ListItem id={y} key={y}>
                {y}
              </ListItem>
            );
          })}
        </Select>
      </Row>
    </Row>
  );
}
