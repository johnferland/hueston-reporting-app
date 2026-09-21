"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import type { AppUser } from "@/lib/auth";
import { brandNavLabel, type Brand } from "@/lib/brands";
import { Logo, Nav, NavBrand, NavLink, NavMenu, NavMenuItem, NavRight, NavSection } from "@/components/ui";

function IconGrid() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="2.75" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.25" y="2.75" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.75" y="11.25" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.25" y="11.25" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconLabs() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 16.5V8.2L10 4.5l6 3.7v8.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 16.5v-4.5h4v4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconAdmin() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 3.5v1.4M10 15.1v1.4M3.5 10h1.4M15.1 10h1.4M5.4 5.4l1 1M13.6 13.6l1 1M5.4 14.6l1-1M13.6 6.4l1-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppNav({
  user,
  brands,
  labBrandSlug,
}: {
  user: AppUser;
  brands: Brand[];
  labBrandSlug?: string;
}) {
  const pathname = usePathname();
  const isLab = user.role === "lab_manager";
  const currentBrandSlug = pathname.startsWith("/brand/") ? pathname.split("/")[2] : undefined;
  const homeHref = isLab && labBrandSlug ? `/brand/${labBrandSlug}` : "/";
  const onAdmin = pathname.startsWith("/admin");
  const onRollup = pathname === "/";

  return (
    <Nav>
      <NavBrand href={homeHref}>
        <Logo className="ds-nav-logo" />
      </NavBrand>

      {!isLab ? (
        <>
          <NavLink href="/" active={onRollup} icon={<IconGrid />}>
            Rollup
          </NavLink>
          {brands.length ? (
            <NavMenu label="Labs" icon={<IconLabs />} defaultOpen={Boolean(currentBrandSlug)}>
              {brands.map((brand) => (
                <NavMenuItem
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  active={brand.slug === currentBrandSlug}
                  title={brand.name}
                >
                  {brandNavLabel(brand)}
                </NavMenuItem>
              ))}
            </NavMenu>
          ) : null}
        </>
      ) : (
        <NavLink href={homeHref} active={pathname.startsWith("/brand/")} icon={<IconGrid />}>
          Dashboard
        </NavLink>
      )}

      {user.role === "super_admin" ? (
        <NavSection label="Admin">
          <NavLink href="/admin" active={onAdmin} icon={<IconAdmin />}>
            Admin
          </NavLink>
        </NavSection>
      ) : null}

      <NavRight>
        <span>
          {user.email} · {user.role.replace("_", " ")}
        </span>
        <UserButton />
      </NavRight>
    </Nav>
  );
}
