import { api, jsonBody, found } from "../../http";
import { saveUser, deleteUser } from "@/data/repositories/users";
import { userInput } from "@/core/use-cases/validation";
import { hashPassword } from "@/data/auth/password";
export const PUT = api(async (request, { params, user }) => {
  const input = userInput(await jsonBody(request), false);
  if (input.password) input.password = await hashPassword(input.password);
  return saveUser(input, params.id, user.id);
}, { developer: true });
export const DELETE = api(async (request, { params, user }) => found(await deleteUser(params.id, user.id)), { developer: true });