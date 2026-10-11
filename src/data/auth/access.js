import { auth } from "../../auth.js";
import { findUser } from "../repositories/users.js";

export class HttpError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}
export async function currentUser() {
  const session = await auth();
  const user = session?.user?.id ? await findUser(session.user.id) : null;
  if (!user || user.sessionVersion !== session.user.sessionVersion) return null;
  return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
}
export async function requireUser(developer = false) {
  const user = await currentUser();
  if (!user) throw new HttpError("Sesi berakhir. Silakan login kembali.", 401);
  if (developer && user.role !== "DEVELOPER") throw new HttpError("Hanya Developer yang dapat melakukan tindakan ini.", 403);
  return user;
}