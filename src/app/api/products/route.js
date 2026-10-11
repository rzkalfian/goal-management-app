import { api } from "../http";
import { listProducts, saveProduct } from "@/data/repositories/products";
import { readProduct } from "./input";
export const GET = api(() => listProducts());
export const POST = api(async (request) => saveProduct(await readProduct(request)));