import { api, jsonBody } from "../http";
import { listProducts, saveProduct } from "@/data/repositories/products";
import { productInput } from "@/core/use-cases/validation";
export const GET = api(() => listProducts());
export const POST = api(async (request) => saveProduct(productInput(await jsonBody(request))));