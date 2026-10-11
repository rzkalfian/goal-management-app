import { api, jsonBody, found } from "../../http";
import { saveCategory, deleteCategory } from "@/data/repositories/categories";
import { text } from "@/core/use-cases/validation";
export const PUT = api(async (request, { params }) => found(await saveCategory(text((await jsonBody(request)).name, "Nama kategori", 60), params.id)));
export const DELETE = api(async (request, { params }) => found(await deleteCategory(params.id)));