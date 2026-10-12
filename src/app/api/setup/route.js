import { api, jsonBody } from "../http";
import { createFirstUser, userCount } from "@/data/repositories/users";
import { userInput, ValidationError } from "@/core/use-cases/validation";
import { hashPassword } from "@/data/auth/password";
import { initialSetupAllowed } from "@/core/use-cases/setup";
import { HttpError } from "@/data/auth/access";
export const POST = api(
  async (request) => {
    if (!initialSetupAllowed())
      throw new HttpError("Setup awal tidak tersedia.", 403);
    if (await userCount())
      throw new ValidationError("Setup sudah selesai. Silakan login.");
    const input = userInput({
      ...(await jsonBody(request)),
      role: "DEVELOPER",
    });
    return createFirstUser({
      ...input,
      password: await hashPassword(input.password),
    });
  },
  { publicAccess: true },
);
