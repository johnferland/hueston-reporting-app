import Link from "next/link";
import type { ReactNode } from "react";
import { Button, buttonClassName } from "@/components/ui/button";

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
    <Button href={href} variant={active ? "primary" : "secondary"}>
      {icon ? <span className="ds-nav-icon">{icon}</span> : null}
      {children}
    </Button>
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
      <summary className={buttonClassName("secondary", "ds-menu-trigger")}>
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
  title,
  children,
}: {
  href: string;
  active?: boolean;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Button href={href} variant={active ? "primary" : "secondary"} title={title}>
      {children}
    </Button>
  );
}

export function NavRight({ children }: { children: ReactNode }) {
  return <div className="ds-nav-right">{children}</div>;
}
