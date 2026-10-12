import { api, found, jsonBody } from "../../http";
import {
  findProduct,
  saveProduct,
  deleteProduct,
} from "@/data/repositories/products";
import { productInput } from "@/core/use-cases/validation";
export const PUT = api(async (request, { params }) => {
  found(await findProduct(params.id));
  return saveProduct(productInput(await jsonBody(request)), params.id);
});
export const DELETE = api(async (request, { params }) =>
  found(await deleteProduct(params.id)),
);
