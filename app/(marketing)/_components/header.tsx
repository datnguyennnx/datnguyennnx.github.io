"use client";

import { usePathname } from "next/navigation";
import { NavList, NavListItems, NavListItem, NavListLink } from "@/components/ui/navigation-menu";

const links = [
  { href: "/", label: "Home" },
  { href: "/notes", label: "Notes" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="relative w-full overflow-hidden">
      <NavList className="relative md:mx-auto">
        <NavListItems className="gap-1">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <NavListItem key={href}>
                <NavListLink
                  href={href}
                  active={isActive}
                  className="rounded-md px-4 py-4 text-sm font-medium transition-surface"
                >
                  {label}
                </NavListLink>
              </NavListItem>
            );
          })}
        </NavListItems>
      </NavList>
    </header>
  );
}
