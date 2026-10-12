import { api, jsonBody } from "../http";
import { listCategories, saveCategory } from "@/data/repositories/categories";
import { categoryInput } from "@/core/use-cases/validation";
export const GET = api(() => listCategories());
export const POST = api(async (request) => saveCategory(categoryInput(await jsonBody(request))));