import { deleteAuthCookies, refreshTokenCookie } from "~/.server/auth-remix";
import type { Route } from "./+types/auth.sign-out";
import { authService } from "~/.server";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const cookies = request.headers.get("Cookie");
  const token = await refreshTokenCookie.parse(cookies);
  if (typeof token !== "string") {
    throw new Response(null, { status: 400 });
  }
  const userId = await authService.decodeToken(token, "refresh");
  if (!userId) {
    throw new Response(null, { status: 403 });
  }
  await authService.deleteToken(userId, token);
  throw redirect("/", {
    headers: deleteAuthCookies,
  });
}
