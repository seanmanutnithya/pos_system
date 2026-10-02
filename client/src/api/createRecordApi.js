import { http } from "@/lib/http";

// list, create, update and remove for one REST resource, e.g. createRecordApi("/brand").
// Each call resolves with the `data` part of the response.
export const createRecordApi = (resource) => ({
  list: ({ signal } = {}) =>
    http.get(resource, { signal }).then((response) => response.data.data),

  create: (values) =>
    http.post(resource, values).then((response) => response.data.data),

  // Partial update: only the keys in `values` change
  update: (id, values) =>
    http.put(`${resource}/${id}`, values).then((response) => response.data.data),

  remove: (id) => http.delete(`${resource}/${id}`),
});
