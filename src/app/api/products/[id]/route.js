import { api, found } from "../../http";
import { findProduct, saveProduct, deleteProduct } from "@/data/repositories/products";
import { readProduct } from "../input";
export const PUT = api(async (request, { params }) => {
  const current = found(await findProduct(params.id));
  return saveProduct(await readProduct(request, current), params.id);
});
export const DELETE = api(async (request, { params }) => found(await deleteProduct(params.id)));