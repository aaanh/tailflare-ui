import { ReactNode } from "react";

export default function SideContainer({ children }: { children: ReactNode }) {
  return <div className="p-4 border dark:bg-foreground/5 gap-2 grid rounded-md shadow">{children}</div>
}