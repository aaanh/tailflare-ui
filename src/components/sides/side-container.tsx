import { ReactNode } from "react";

export default function SideContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 dark:bg-foreground/5 shadow p-4 border rounded-md">
      {children}
    </div>
  );
}
