import { Link, Outlet, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { UploadButton } from "~/components/uploader";
import { runtimeConfig } from "~/.server";
import type { Route } from "./+types/app";
import { Logo } from "~/components/icon";

const navRoutes: {
  title: string;
  path: string;
}[] = [
  { title: "Your clips", path: "/app" },
  { title: "Account", path: "/app/account" },
  {
    title: "Sign out",
    path: "/auth/sign-out",
  },
];

export function loader() {
  return { baseUrl: runtimeConfig.baseUrl };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const route = useLocation();
  return (
    <>
      <header className="p-4 flex justify-between">
        <Logo />
        <nav className="flex items-center">
          {route.pathname == navRoutes[0].path && (
            <UploadButton baseUrl={loaderData.baseUrl} />
          )}
          {navRoutes.map((navRoute) => (
            <Link
              key={navRoute.path}
              to={navRoute.path}
              className={cn(
                "ml-4",
                navRoute.path == route.pathname && "underline"
              )}
            >
              {navRoute.title}
            </Link>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
