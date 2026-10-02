import { useMemo, useState } from "react";
import PageActions from "@/components/layout/PageActions";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import Menu from "@/components/ui/Menu";
import Pagination from "@/components/ui/Pagination";
import SegmentedControl from "@/components/ui/SegmentedControl";
import SelectionBar from "@/components/ui/SelectionBar";
import StatCard from "@/components/ui/StatCard";
import Switch from "@/components/ui/Switch";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { usePageSearch } from "@/hooks/usePageSearch";
import { useToast } from "@/hooks/useToast";
import { downloadCsv } from "@/lib/csv";
import { capitalize, formatFileDate, pluralize } from "@/lib/format";
import { getErrorMessage } from "@/lib/http";
import DeleteRecordsDialog from "./DeleteRecordsDialog";
import RecordFormDialog from "./RecordFormDialog";
import { useListControls } from "./useListControls";
import { useRecords } from "./useRecords";

const PAGE_SIZE = 10;

// One tab of the Product Menu: stat cards, filter chips, a sortable table with
// row selection and pagination, bulk actions, CSV export, and the add, edit
// and delete dialogs. Everything specific to a record type comes from
// `config`; see features/product/category/categoryConfig.jsx for an example.
// `lookups` and `lookupState` are passed on to the form (see RecordFormDialog).
const RecordPanel = ({ config, lookups, lookupState }) => {
  const { idKey, noun, getName } = config;
  const { items, status, error, reload, create, update, updateMany, removeMany } = useRecords(
    config.api,
    idKey,
  );
  const { search, setSearch } = usePageSearch();
  const { notify } = useToast();
  const list = useListControls(items, { config, search, pageSize: PAGE_SIZE });
  // One setting shared by every tab
  const [showStats, setShowStats] = useLocalStorageState("productMenu.showStats", true);
  const [bulkAction, setBulkAction] = useState(null); // "activate" | "deactivate" while running
  // null, { mode: "create" }, { mode: "edit", record } or { mode: "delete", records }
  const [dialog, setDialog] = useState(null);

  const stats = useMemo(() => config.getStats(items), [config, items]);
  const isLoading = status === "loading";
  const isFirstLoad = isLoading && items.length === 0;
  const isFiltered = search.trim() !== "" || list.filter !== config.filters[0].value;
  const title = capitalize(noun.singular);
  const selected = list.selectedItems;

  const countOf = (count) => pluralize(count, noun.singular, noun.plural);

  // "Hot Coffee" for one record, "3 categories" for several
  const describe = (ids, records) => {
    const record = ids.length === 1 && records.find((item) => item[idKey] === ids[0]);
    return record ? getName(record) : countOf(ids.length);
  };

  const openCreate = () => setDialog({ mode: "create" });
  const closeDialog = () => setDialog(null);

  const clearFilters = () => {
    setSearch("");
    list.setFilter(config.filters[0].value);
  };

  const handleSave = async (values) => {
    if (dialog.mode === "edit") {
      await update(dialog.record[idKey], values);
      notify(`${title} updated`);
    } else {
      await create(values);
      notify(`${title} added`);
    }
    closeDialog();
  };

  // Used by the row menu, the selection bar and the delete dialog
  const setActive = async (targets, active) => {
    const ids = targets.filter((record) => record.active !== active).map((record) => record[idKey]);
    if (ids.length === 0) return;
    const state = active ? "active" : "inactive";
    const { updated, failed } = await updateMany(ids, { active });
    if (updated.length === 1) notify(`${describe(updated, targets)} is now ${state}`);
    else if (updated.length > 1) notify(`${countOf(updated.length)} set to ${state}`);
    if (failed.length > 0) {
      const failedIds = failed.map((failure) => failure.id);
      notify(
        `Couldn't update ${describe(failedIds, targets)}. ${getErrorMessage(failed[0].error)}`,
        { tone: "error" },
      );
    }
  };

  const handleBulkSetActive = async (active) => {
    setBulkAction(active ? "activate" : "deactivate");
    await setActive(selected, active);
    setBulkAction(null);
  };

  const handleDelete = async (targets) => {
    const result = await removeMany(targets.map((record) => record[idKey]));
    if (result.deleted.length > 0) {
      notify(`${describe(result.deleted, targets)} deleted`);
      list.setSelectedIds((current) => {
        const next = new Set(current);
        result.deleted.forEach((id) => next.delete(id));
        return next;
      });
    }
    return result;
  };

  const handleExport = () => {
    downloadCsv(`${noun.plural}-${formatFileDate()}.csv`, list.sortedItems, config.csvColumns);
    notify(`Exported ${countOf(list.sortedItems.length)}`);
  };

  const columns = [
    ...config.columns,
    {
      key: "actions",
      header: "Action",
      className: "w-px",
      render: (record) => (
        <Menu
          label={`Actions for ${getName(record)}`}
          items={[
            { label: "Edit", icon: "pencil", onSelect: () => setDialog({ mode: "edit", record }) },
            record.active
              ? { label: "Set Inactive", icon: "pause-circle", onSelect: () => setActive([record], false) }
              : { label: "Set Active", icon: "check-circle", onSelect: () => setActive([record], true) },
            {
              label: "Delete",
              icon: "trash",
              tone: "danger",
              onSelect: () => setDialog({ mode: "delete", records: [record] }),
            },
          ]}
        />
      ),
    },
  ];

  const emptyState = isFiltered ? (
    <EmptyState
      icon="search"
      title={`No matching ${noun.plural}`}
      description="Try a different search or filter."
      action={
        <Button variant="ghost" onClick={clearFilters}>
          Clear Filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={config.icon}
      title={`No ${noun.plural} yet`}
      description={config.emptyDescription}
      action={
        <Button icon="plus" onClick={openCreate}>
          Add {title}
        </Button>
      }
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <PageActions>
        <Button
          variant="ghost"
          icon="download"
          onClick={handleExport}
          disabled={list.sortedItems.length === 0}
          title={`Download the ${noun.plural} shown below as a CSV file`}
        >
          Export
        </Button>
        <Button icon="plus" onClick={openCreate}>
          Add {title}
        </Button>
      </PageActions>

      {showStats && status !== "error" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} loading={isFirstLoad} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <SegmentedControl
          aria-label={`Filter ${noun.plural}`}
          size="sm"
          value={list.filter}
          onChange={list.setFilter}
          options={config.filters.map((option) => ({
            value: option.value,
            label: option.label,
            count: isFirstLoad ? undefined : list.filterCounts[option.value],
          }))}
        />
        <div className="flex shrink-0 items-center gap-4">
          <Button variant="ghost" size="sm" icon="refresh" loading={isLoading} onClick={reload}>
            Refresh
          </Button>
          <Switch label="Show Statistics" checked={showStats} onChange={setShowStats} />
        </div>
      </div>

      {selected.length > 0 && (
        <SelectionBar count={selected.length} onClear={() => list.setSelectedIds(new Set())}>
          <Button
            variant="ghost"
            size="sm"
            icon="check-circle"
            loading={bulkAction === "activate"}
            disabled={bulkAction !== null || selected.every((record) => record.active)}
            onClick={() => handleBulkSetActive(true)}
          >
            Set Active
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon="pause-circle"
            loading={bulkAction === "deactivate"}
            disabled={bulkAction !== null || selected.every((record) => !record.active)}
            onClick={() => handleBulkSetActive(false)}
          >
            Set Inactive
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon="trash"
            disabled={bulkAction !== null}
            onClick={() => setDialog({ mode: "delete", records: selected })}
          >
            Delete
          </Button>
        </SelectionBar>
      )}

      {status === "error" ? (
        <Alert
          title={`Couldn't load ${noun.plural}`}
          action={
            <Button variant="outline" size="sm" icon="refresh" onClick={reload}>
              Try Again
            </Button>
          }
        >
          {error}
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable
            caption={capitalize(noun.plural)}
            columns={columns}
            rows={list.pageItems}
            getRowKey={(record) => record[idKey]}
            getRowLabel={getName}
            loading={isFirstLoad}
            emptyState={emptyState}
            sort={list.sort}
            onSortChange={list.setSort}
            selectedKeys={list.selectedIds}
            onSelectionChange={list.setSelectedIds}
            className={config.tableClassName}
          />
          {!isFirstLoad && list.sortedItems.length > 0 && (
            <Pagination
              page={list.page}
              pageSize={PAGE_SIZE}
              total={list.sortedItems.length}
              onPageChange={list.setPage}
            />
          )}
        </div>
      )}

      {(dialog?.mode === "create" || dialog?.mode === "edit") && (
        <RecordFormDialog
          config={config}
          record={dialog.record}
          records={items}
          lookups={lookups}
          lookupState={lookupState}
          onSubmit={handleSave}
          onClose={closeDialog}
        />
      )}
      {dialog?.mode === "delete" && (
        <DeleteRecordsDialog
          config={config}
          records={dialog.records}
          onDelete={handleDelete}
          onDeactivate={(targets) => setActive(targets, false)}
          onClose={closeDialog}
        />
      )}
    </div>
  );
};

export default RecordPanel;
