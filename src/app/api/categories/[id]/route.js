import { api, jsonBody, found } from "../../http";
import { saveCategory, deleteCategory } from "@/data/repositories/categories";
import { categoryInput } from "@/core/use-cases/validation";
export const PUT = api(async (request, { params }) =>
  found(await saveCategory(categoryInput(await jsonBody(request)), params.id)),
);
export const DELETE = api(async (request, { params }) =>
  found(await deleteCategory(params.id)),
);
