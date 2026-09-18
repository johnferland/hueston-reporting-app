import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function SegmentedControl({ children }: { children: ReactNode }) {
  return <div className="ds-segmented">{children}</div>;
}

export function SegmentedItem({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Button href={href} variant={active ? "primary" : "secondary"}>
      {children}
    </Button>
  );
}
