import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Shell({ children }: { children: ReactNode }) {
  return <div className="ds-shell">{children}</div>;
}

export function ShellMain({ children }: { children: ReactNode }) {
  return <div className="ds-shell-main">{children}</div>;
}

export function Nav({ children }: { children: ReactNode }) {
  return <aside className="ds-nav ds-grain">{children}</aside>;
}

export function NavBrand({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="ds-nav-brand">
      {children}
    </Link>
  );
}

export function NavSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ds-nav-section">
      <p className="ds-nav-label">{label}</p>
      {children}
    </div>
  );
}

export function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn("ds-nav-link", active && "ds-nav-link-active")}>
      {icon ? <span className="ds-nav-icon">{icon}</span> : null}
      {children}
    </Link>
  );
}

export function NavMenu({
  label,
  icon,
  defaultOpen,
  children,
}: {
  label: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="ds-menu" open={defaultOpen || undefined}>
      <summary className="ds-nav-link ds-menu-trigger">
        {icon ? <span className="ds-nav-icon">{icon}</span> : null}
        {label}
      </summary>
      <div className="ds-menu-list">{children}</div>
    </details>
  );
}

export function NavMenuItem({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn("ds-menu-item", active && "ds-menu-item-active")}>
      {children}
    </Link>
  );
}

export function NavRight({ children }: { children: ReactNode }) {
  return <div className="ds-nav-right">{children}</div>;
}
