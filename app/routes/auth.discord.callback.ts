import { ArcticFetchError, OAuth2RequestError } from "arctic";
import { redirect, type LoaderFunctionArgs } from "react-router";
import { authService, discord } from "~/.server";
import {
  accessTokenCookie,
  refreshTokenCookie,
  stateCookie,
} from "~/.server/auth-remix";
import type { Route } from "./+types/auth.discord.callback";

export async function loader({ params, request }: Route.LoaderArgs) {
  const cookies = request.headers.get("Cookie");
  const searchParams = new URL(request.url).searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedStateCookie = await stateCookie.parse(cookies);
  if (!code || !state || !storedStateCookie || state !== storedStateCookie) {
    return redirect("/?error=invalid_state");
  }

  try {
    const oauthTokens = await discord.validateAuthorizationCode(code);

    const userInfoReq = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${oauthTokens.accessToken()}`,
      },
    });
    const userInfo: DiscordUserInfo = await userInfoReq.json();
    const tokens = await authService.createOrSignIn(
      userInfo.id,
      userInfo.username
    );
    if (!tokens) {
      return redirect("/?error=auth_unknown");
    }

    return redirect("/app", {
      headers: [
        ["Set-Cookie", await accessTokenCookie.serialize(tokens.accessToken)],
        ["Set-Cookie", await refreshTokenCookie.serialize(tokens.refreshToken)],
        ["Set-Cookie", "clipkit_state=; Max-Age=0; Path=/;"],
      ],
    });
  } catch (e) {
    console.log(e);
    if (e instanceof OAuth2RequestError) {
      return redirect("/?error=oauth2");
    }
    if (e instanceof ArcticFetchError) {
      return redirect("/?error=arctic");
    }
    throw e;
  }
}

type DiscordUserInfo = {
  id: string;
  username: string;
};
