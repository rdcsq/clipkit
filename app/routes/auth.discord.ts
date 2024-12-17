import { generateState } from "arctic";
import { redirect } from "react-router";
import { discord } from "~/.server";
import { stateCookie } from "~/.server/auth-remix";

export async function loader() {
  const state = generateState();
  const url = discord.createAuthorizationURL(state, ["identify"]);

  return redirect(url.toString(), {
    headers: {
      "Set-Cookie": await stateCookie.serialize(state),
    },
  });
}
