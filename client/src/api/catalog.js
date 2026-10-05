import { createRecordApi } from "./createRecordApi";

export const categoryApi = createRecordApi("/category");
export const brandApi = createRecordApi("/brand", { images: true });
export const attributeApi = createRecordApi("/attribute");
export const productApi = createRecordApi("/product", { images: true });
