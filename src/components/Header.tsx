import Link from "next/link";
import { useRouter } from "next/router";
import {
  ChevronDown,
  ExternalLink,
  Footprints,
  LogIn,
  LogOut,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

import { cn } from "~/utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

const NavLink = ({ href, children }: NavLinkProps) => {
  const { asPath } = useRouter();
  return (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-foreground/80",
        asPath === href ? "text-foreground" : "text-foreground/60",
      )}
    >
      {children}
    </Link>
  );
};

const ProfileMenu = () => {
  const { data: session } = useSession();
  return session ? (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://github.com/stianthaulow.png" />
          <AvatarFallback>ST</AvatarFallback>
        </Avatar>
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>
          <a
            className="flex w-full items-center justify-between"
            href="https://www.strava.com/dashboard"
            target="_blank"
          >
            Go to Strava
            <ExternalLink className="h-4 w-4" />
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => signOut()}>
          <div className="flex w-full items-center justify-between">
            Sign out
            <LogOut className="h-4 w-4" />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button size="sm" onClick={() => signIn()} className="flex gap-2">
      Sign in <LogIn className="h-4 w-4" />
    </Button>
  );
};

const MainNav = () => (
  <div className="hidden w-full justify-between md:flex">
    <Link href="/" className="mr-6 flex items-center space-x-2">
      <Footprints />
      StreakStride
    </Link>
    <nav className="flex items-center space-x-6 text-sm font-medium">
      <NavLink href="/">Home</NavLink>
      <NavLink href="/stats">Stats</NavLink>
      <NavLink href="/pace">Pace</NavLink>
      <ProfileMenu />
    </nav>
  </div>
);

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-foreground/10">
      <div className="container flex h-14 items-center">
        <MainNav />
      </div>
    </header>
  );
}
