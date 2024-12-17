import { createCookie, redirect } from "react-router";
import { authService } from ".";

export const accessTokenCookie = createCookie("clipkit_access_token", {
  maxAge: 4 * 60,
  secure: true,
  sameSite: "lax",
  httpOnly: true,
  path: "/",
});

export const refreshTokenCookie = createCookie("clipkit_refresh_token", {
  maxAge: 60 * 60 * 24 * 7,
  secure: true,
  sameSite: "lax",
  httpOnly: true,
  path: "/",
});

export const stateCookie = createCookie("clipkit_state", {
  maxAge: 60 * 60,
});

export const getUser = async (
  request: Request
): Promise<UserAuthResult | null> => {
  const cookies = request.headers.get("Cookie");
  const [accessToken, refreshToken] = await Promise.all([
    accessTokenCookie.parse(cookies),
    refreshTokenCookie.parse(cookies),
  ]);

  if (accessToken) {
    const user = await authService.decodeToken(accessToken);
    if (user) {
      return { userId: user };
    }
  }

  if (refreshToken == null) {
    return null;
  }

  const tokens = await authService.refreshTokens(refreshToken);
  if (!tokens) {
    return null;
  }

  return {
    userId: tokens.userId,
    headers: [
      ["Set-Cookie", await accessTokenCookie.serialize(tokens.accessToken)],
      ["Set-Cookie", await refreshTokenCookie.serialize(tokens.refreshToken)],
    ],
  };
};

export const requireUser = async (
  request: Request
): Promise<UserAuthResult> => {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/", { headers: deleteAuthCookies });
  }
  return user;
};

export const deleteAuthCookies: [string, string][] = [
  ["Set-Cookie", "clipkit_access_token=; Max-Age=0; Path=/;"],
  ["Set-Cookie", "clipkit_refresh_token=; Max-Age=0; Path=/;"],
];

export type UserAuthResult = {
  userId: number;
  headers?: [string, string][];
};
