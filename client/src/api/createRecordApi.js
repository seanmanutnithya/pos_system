import { http } from "@/lib/http";

// list, create, update and remove for one REST resource, e.g. createRecordApi("/brand").
// With `images: true` it also gets uploadImage and removeImage, for resources
// whose records have one image (brands and products).
// Each call resolves with the `data` part of the response.
export const createRecordApi = (resource, { images = false } = {}) => ({
  list: ({ signal } = {}) =>
    http.get(resource, { signal }).then((response) => response.data.data),

  create: (values) =>
    http.post(resource, values).then((response) => response.data.data),

  // Partial update: only the keys in `values` change
  update: (id, values) =>
    http.put(`${resource}/${id}`, values).then((response) => response.data.data),

  remove: (id) => http.delete(`${resource}/${id}`),

  ...(images && {
    // Adds or replaces the image. Sent as multipart/form-data with the file in
    // the "image" field; the browser sets the Content-Type and its boundary.
    uploadImage: (id, file) => {
      const form = new FormData();
      form.append("image", file);
      return http.put(`${resource}/${id}/image`, form).then((response) => response.data.data);
    },

    removeImage: (id) =>
      http.delete(`${resource}/${id}/image`).then((response) => response.data.data),
  }),
});
