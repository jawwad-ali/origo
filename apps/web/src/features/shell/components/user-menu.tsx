"use client";

import { MEMBERSHIP_ROLE_LABELS, type CurrentUserDto } from "@origo/shared";
import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { logout } from "@/features/auth/services/auth-service";
import { ROUTES } from "@/lib/routes";
import { initialsOf } from "../utils";

export const UserMenu = ({ user }: { user: CurrentUserDto }) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isSigningOut, startSignOut] = useTransition();
  const subtitle = user.isPlatformAdmin
    ? "Platform admin"
    : user.membership
      ? MEMBERSHIP_ROLE_LABELS[user.membership.role]
      : user.email;

  const handleSignOut = (): void => {
    startSignOut(async () => {
      try {
        await logout();
        router.replace(ROUTES.login);
        router.refresh();
      } catch {
        toast.error("Couldn't sign out", { description: "Check your connection and try again." });
      }
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-md">
                <AvatarFallback className="bg-accent text-accent-foreground rounded-md text-xs font-medium">
                  {initialsOf(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">{user.fullName}</span>
                <span className="text-muted-foreground truncate text-xs">{subtitle}</span>
              </span>
              <ChevronsUpDown className="text-muted-foreground ml-auto size-4" aria-hidden="true" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
          >
            <DropdownMenuLabel className="font-normal">
              <span className="block truncate text-sm font-medium">{user.fullName}</span>
              <span className="text-muted-foreground block truncate text-xs">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <Sun className="size-4" aria-hidden="true" /> Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="size-4" aria-hidden="true" /> Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor className="size-4" aria-hidden="true" /> System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} disabled={isSigningOut}>
              <LogOut className="size-4" aria-hidden="true" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
