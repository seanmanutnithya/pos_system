import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage, isCanceled } from "@/lib/http";

// Runs `task` for every id at once. One failure doesn't stop the others.
const settleEach = async (ids, task) => {
  const results = await Promise.allSettled(ids.map((id) => task(id)));
  const fulfilled = [];
  const failed = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      fulfilled.push({ id: ids[index], value: result.value });
    } else {
      failed.push({ id: ids[index], error: result.reason });
    }
  });
  return { fulfilled, failed };
};

// Loads the records from `api` (see api/createRecordApi.js) and keeps the list
// in sync after changes. create and update throw on failure so a form can show
// the error; updateMany and removeMany report failures per id instead.
export const useRecords = (api, idKey) => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState(null);
  const latestRequest = useRef(0);

  // Only sets state once the request settles. The "loading" state comes from
  // the initial state on mount, and from reload() afterwards.
  const fetchItems = useCallback(
    ({ signal } = {}) => {
      // Ignore responses from older requests, e.g. a slow first load that
      // finishes after the user pressed Refresh
      const requestId = ++latestRequest.current;
      const isLatest = () => requestId === latestRequest.current;

      return api.list({ signal }).then(
        (data) => {
          if (!isLatest()) return;
          setItems(data);
          setError(null);
          setStatus("success");
        },
        (err) => {
          if (isCanceled(err) || !isLatest()) return;
          setError(getErrorMessage(err));
          setStatus("error");
        },
      );
    },
    [api],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchItems({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchItems]);

  const reload = useCallback(() => {
    setStatus("loading");
    return fetchItems();
  }, [fetchItems]);

  const create = useCallback(
    async (values) => {
      const created = await api.create(values);
      // New ids are the highest, so appending keeps the list in id order
      setItems((current) => [...current, created]);
      return created;
    },
    [api],
  );

  // Puts a record returned by the API in place of the old one
  const replaceItem = useCallback(
    (updated) => {
      setItems((current) =>
        current.map((item) => (item[idKey] === updated[idKey] ? updated : item)),
      );
      return updated;
    },
    [idKey],
  );

  const update = useCallback(
    async (id, values) => replaceItem(await api.update(id, values)),
    [api, replaceItem],
  );

  // Only for record types whose api has images (see api/createRecordApi.js)
  const uploadImage = useCallback(
    async (id, file) => replaceItem(await api.uploadImage(id, file)),
    [api, replaceItem],
  );

  const removeImage = useCallback(
    async (id) => replaceItem(await api.removeImage(id)),
    [api, replaceItem],
  );

  const updateMany = useCallback(
    async (ids, values) => {
      const { fulfilled, failed } = await settleEach(ids, (id) => api.update(id, values));
      const updatedById = new Map(fulfilled.map(({ id, value }) => [id, value]));
      setItems((current) => current.map((item) => updatedById.get(item[idKey]) ?? item));
      return { updated: fulfilled.map(({ id }) => id), failed };
    },
    [api, idKey],
  );

  const removeMany = useCallback(
    async (ids) => {
      const { fulfilled, failed } = await settleEach(ids, (id) => api.remove(id));
      const deletedIds = new Set(fulfilled.map(({ id }) => id));
      setItems((current) => current.filter((item) => !deletedIds.has(item[idKey])));
      return { deleted: [...deletedIds], failed };
    },
    [api, idKey],
  );

  return {
    items,
    status,
    error,
    reload,
    create,
    update,
    updateMany,
    removeMany,
    uploadImage,
    removeImage,
  };
};
