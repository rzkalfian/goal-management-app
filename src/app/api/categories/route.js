import { api, jsonBody } from "../http";
import { listCategories, saveCategory } from "@/data/repositories/categories";
import { text } from "@/core/use-cases/validation";
export const GET = api(() => listCategories());
export const POST = api(async (request) => saveCategory(text((await jsonBody(request)).name, "Nama kategori", 60)));