import { RecordResponse } from "cloudflare/resources/dns/records.mjs";
import { TableCell, TableRow } from "../ui/table";

interface HostItemProps {
  record: RecordResponse;
}

export default function HostItem({ record }: HostItemProps) {
  return (
    <TableRow>
      <TableCell className="h-20 w-[400px]">
        {record.name}
      </TableCell>
      <TableCell className="h-20 w-[400px]">{record.content}</TableCell>
    </TableRow>
  );
}
