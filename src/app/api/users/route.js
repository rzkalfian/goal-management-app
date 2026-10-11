import { api, jsonBody } from "../http";
import { listUsers, saveUser } from "@/data/repositories/users";
import { userInput } from "@/core/use-cases/validation";
import { hashPassword } from "@/data/auth/password";
export const GET = api(() => listUsers());
export const POST = api(async (request) => {
  const input = userInput(await jsonBody(request));
  return saveUser({ ...input, password: await hashPassword(input.password) });
}, { developer: true });