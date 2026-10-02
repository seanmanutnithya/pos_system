import { Fragment, useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { capitalize, formatNumber } from "@/lib/format";
import { getErrorMessage, getErrorStatus } from "@/lib/http";

const NAMES_SHOWN = 5;

const NameList = ({ records, idKey, getName }) => (
  <ul className="list-disc space-y-1 pl-5">
    {records.slice(0, NAMES_SHOWN).map((record) => (
      <li key={record[idKey]} className="font-medium">
        {getName(record)}
      </li>
    ))}
    {records.length > NAMES_SHOWN && (
      <li className="text-muted">and {formatNumber(records.length - NAMES_SHOWN)} more</li>
    )}
  </ul>
);

// Confirms deleting one or more records. Records that are still in use can't
// be deleted (the API answers 409), so for those the dialog offers to
// deactivate them instead.
// onDelete(records) resolves with { deleted, failed } (see useRecords).
const DeleteRecordsDialog = ({ config, records, onDelete, onDeactivate, onClose }) => {
  const { idKey, noun, getName, inUseBy } = config;
  const [pending, setPending] = useState(null); // "delete" | "deactivate"
  const [toDelete, setToDelete] = useState(records);
  const [inUse, setInUse] = useState([]);
  const [error, setError] = useState(null);

  const stage = inUse.length > 0 ? "in-use" : "confirm";
  const activeInUse = inUse.filter((record) => record.active);
  const names = { idKey, getName };

  const handleDelete = async () => {
    setPending("delete");
    setError(null);
    const { failed } = await onDelete(toDelete);
    if (failed.length === 0) {
      onClose();
      return;
    }

    const errorById = new Map(failed.map((failure) => [failure.id, failure.error]));
    const isInUse = (record) => getErrorStatus(errorById.get(record[idKey])) === 409;
    const notDeleted = toDelete.filter((record) => errorById.has(record[idKey]));
    const otherFailure = failed.find((failure) => getErrorStatus(failure.error) !== 409);

    setInUse(notDeleted.filter(isInUse));
    // Anything that failed for another reason can be tried again
    setToDelete(notDeleted.filter((record) => !isInUse(record)));
    if (otherFailure) setError(getErrorMessage(otherFailure.error));
    setPending(null);
  };

  const handleDeactivate = async () => {
    setPending("deactivate");
    await onDeactivate(activeInUse);
    onClose();
  };

  let title;
  let body;
  if (stage === "in-use") {
    title =
      inUse.length === 1
        ? `${capitalize(noun.singular)} is in use`
        : `${formatNumber(inUse.length)} ${noun.plural} are in use`;
    body =
      inUse.length === 1 ? (
        <p>
          <strong>{getName(inUse[0])}</strong> is still used by {inUseBy}, so it can&apos;t be
          deleted.{" "}
          {inUse[0].active
            ? "Deactivate it instead to retire it and keep its history."
            : "It's already inactive."}
        </p>
      ) : (
        <>
          <p>
            These {noun.plural} are still used by {inUseBy}, so they can&apos;t be deleted:
          </p>
          <NameList records={inUse} {...names} />
          <p>
            {activeInUse.length > 0
              ? "Deactivate them instead to retire them and keep their history."
              : "They're already inactive."}
          </p>
        </>
      );
  } else {
    title =
      toDelete.length === 1
        ? `Delete ${noun.singular}?`
        : `Delete ${formatNumber(toDelete.length)} ${noun.plural}?`;
    body =
      toDelete.length === 1 ? (
        <p>
          <strong>{getName(toDelete[0])}</strong> will be permanently deleted. This can&apos;t be
          undone.
        </p>
      ) : (
        <>
          <p>These {noun.plural} will be permanently deleted. This can&apos;t be undone.</p>
          <NameList records={toDelete} {...names} />
        </>
      );
  }

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={pending === null}
      title={title}
      footer={
        // The key swaps in fresh buttons when the stage changes, so autoFocus
        // moves focus to Close after the delete button disappears
        <Fragment key={stage}>
          <Button
            variant="ghost"
            data-autofocus
            autoFocus={stage === "in-use"}
            onClick={onClose}
            disabled={pending !== null}
          >
            {stage === "in-use" ? "Close" : "Cancel"}
          </Button>
          {stage === "confirm" && (
            <Button variant="danger" loading={pending === "delete"} onClick={handleDelete}>
              Delete
            </Button>
          )}
          {stage === "in-use" && activeInUse.length > 0 && (
            <Button variant="dark" loading={pending === "deactivate"} onClick={handleDeactivate}>
              Deactivate Instead
            </Button>
          )}
        </Fragment>
      }
    >
      <div className="flex flex-col gap-4 text-sm">
        {body}
        {error && <Alert>{error}</Alert>}
      </div>
    </Modal>
  );
};

export default DeleteRecordsDialog;
