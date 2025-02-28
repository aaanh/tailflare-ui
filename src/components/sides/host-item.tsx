import { RecordResponse } from "cloudflare/resources/dns/records.mjs";
import { TableCell, TableRow } from "../ui/table";
import { ArrowRightToLineIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipTrigger } from "../ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { ReactNode } from "react";
import { useHover } from "@/contexts/hover-context";
import { getDeepestSubdomain } from "@/lib/utils";

interface HostItemProps {
  record: RecordResponse;
  children?: ReactNode;
}

export default function HostItem({ record, children }: HostItemProps) {
  const { hoveredHost, setHoveredHost } = useHover();
  const deepestSubdomain = getDeepestSubdomain(record.name ?? "");
  const isHighlighted = hoveredHost === deepestSubdomain;

  return (
    <TableRow
      className={`group h-[3.5rem] ${isHighlighted ? "bg-muted" : ""}`}
      onMouseEnter={() => setHoveredHost(deepestSubdomain)}
      onMouseLeave={() => setHoveredHost(null)}
    >
      <TableCell className="font-mono">{record.name}</TableCell>
      {record.content && (
        <TableCell className="font-mono">{record.content}</TableCell>
      )}
      {children && <TableCell className="w-[50px]">{children}</TableCell>}
    </TableRow>
  );
}
