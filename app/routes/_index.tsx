import { Button } from "~/components/ui/button";
import type { Route } from "./+types/_index";
import { getUser } from "~/.server/auth-remix";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (user) {
    return redirect("/app", { headers: user.headers });
  }
}

export default function Page() {
  return (
    <main className="mx-auto my-0 w-min p-8">
      <Button
        className="bg-[#5865F2] hover:bg-[#5865F2] hover:brightness-105"
        asChild
      >
        <a href="/auth/discord">Sign in with Discord</a>
      </Button>
    </main>
  );
}
