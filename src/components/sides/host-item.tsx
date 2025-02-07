import { RecordResponse } from "cloudflare/resources/dns/records.mjs";
import { TableCell, TableRow } from "../ui/table";
import { cn } from "@/lib/utils";

interface HostItemProps {
  record: RecordResponse;
}

export default function HostItem({ record }: HostItemProps) {
  return (
    <TableRow>
      <TableCell
        className={cn("h-24", record.content?.length ?? 0 > 0 ? "" : "w-full")}
      >
        {record.name}
      </TableCell>
      {record.content?.length ?? 0 > 0 ? (
        <TableCell className="w-[400px] h-24">{record.content}</TableCell>
      ) : null}
    </TableRow>
  );
}
