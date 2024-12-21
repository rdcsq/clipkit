import { useEffect } from "react";
import { data, redirect, useFetcher } from "react-router";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "~/components/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { ApiResult } from "~/lib/api-result";
import type { Route } from "./+types/app.account";
import { deleteAuthCookies, requireUser } from "~/.server/auth-remix";
import { accountsService } from "~/.server";

export async function loader({ request }: Route.LoaderArgs) {
  const { userId, headers } = await requireUser(request);
  const user = await accountsService.getUserDetails(userId);
  if (!user) {
    throw redirect("/", { headers: deleteAuthCookies });
  }
  return data(user, { headers });
}

export default function Account({ loaderData }: Route.ComponentProps) {
  const usernameFetcher = useFetcher();

  useEffect(() => {
    if (!usernameFetcher.data) return;
    const res = usernameFetcher.data as ApiResult;

    if (res.success) {
      toast.success("Username has been updated.");
    } else {
      toast.error(res.errorMessage);
    }
  }, [usernameFetcher.data]);

  return (
    <>
      <usernameFetcher.Form
        className="max-w-2xl mx-auto my-0 mb-4"
        method="post"
        action="/api/account/update-username"
      >
        <Card className="mx-4">
          <CardContent>
            <h1 className="font-bold text-xl mb-2">Username</h1>
            <p className="mb-2 text-sm">
              This is the name that will appear under your videos.
            </p>
            <Input
              placeholder="Username"
              id="username"
              name="username"
              className="max-w-72"
              defaultValue={loaderData.username}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={usernameFetcher.state !== "idle"}>
              Save
            </Button>
          </CardFooter>
        </Card>
      </usernameFetcher.Form>
    </>
  );
}
