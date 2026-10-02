import Badge from "@/components/ui/Badge";

const StatusBadge = ({ active }) =>
  active ? <Badge tone="brand">Active</Badge> : <Badge tone="neutral">Inactive</Badge>;

export default StatusBadge;
