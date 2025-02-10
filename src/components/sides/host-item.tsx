import { RecordResponse } from "cloudflare/resources/dns/records.mjs";
import { TableCell, TableRow } from "../ui/table";
import { ArrowRightToLineIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipTrigger } from "../ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

interface HostItemProps {
  record: RecordResponse;
  children?: ReactNode;
}

export default function HostItem({ record, children }: HostItemProps) {
  return (
    <TableRow className="group">
      <TableCell className="w-[400px] h-20">{record.name}</TableCell>
      <TableCell className="w-[400px] h-20">{record.content}</TableCell>
      {children && <TableCell>{children}</TableCell>}
    </TableRow>
  );
}
