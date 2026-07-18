import { cn } from "@/lib/utils";

function NavList({ className, children, ...props }: React.ComponentPropsWithRef<"nav">) {
  return (
    <nav
      data-slot="navigation-menu"
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

function NavListItems({ className, ...props }: React.ComponentPropsWithRef<"ul">) {
  return (
    <ul
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-0", className)}
      {...props}
    />
  );
}

function NavListItem({ className, ...props }: React.ComponentPropsWithRef<"li">) {
  return <li data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />;
}

function NavListLink({
  className,
  active,
  ...props
}: React.ComponentPropsWithRef<"a"> & { active?: boolean }) {
  return (
    <a
      data-slot="navigation-menu-link"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-md p-2 text-sm transition-surface outline-none hover:bg-muted focus:bg-muted focus-ring data-[active=true]:bg-muted/50 data-[active=true]:hover:bg-muted data-[active=true]:focus:bg-muted [&_svg:not([class*='size-'])]:size-4 min-h-12",
        className,
      )}
      {...props}
    />
  );
}

export { NavList, NavListItem, NavListLink, NavListItems };
