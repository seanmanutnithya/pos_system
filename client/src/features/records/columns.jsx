import RecordCell from "./RecordCell";
import StatusBadge from "./StatusBadge";
import { toTime } from "./listHelpers";
import { formatDate, formatDateTime } from "@/lib/format";

// Table columns that several record types share. A column is
// { key, header, render(record), sortValue?(record), className? }.

export const nameColumn = ({ header, getTitle, getSubtitle }) => ({
  key: "name",
  header,
  sortValue: getTitle,
  render: (record) => (
    <RecordCell
      title={getTitle(record)}
      subtitle={getSubtitle?.(record)}
      muted={!record.active}
    />
  ),
});

export const statusColumn = () => ({
  key: "status",
  header: "Status",
  // Active first when sorted ascending
  sortValue: (record) => Number(!record.active),
  render: (record) => <StatusBadge active={record.active} />,
});

export const createdColumn = () => ({
  key: "created",
  header: "Created",
  className: "whitespace-nowrap text-muted",
  sortValue: (record) => toTime(record.created_date),
  render: (record) => formatDate(record.created_date),
});

export const updatedColumn = () => ({
  key: "updated",
  header: "Last Updated",
  className: "whitespace-nowrap text-muted",
  sortValue: (record) => toTime(record.updated_date),
  render: (record) => formatDateTime(record.updated_date),
});
