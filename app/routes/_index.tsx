import { Button } from "~/components/ui/button";

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
