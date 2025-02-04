import { RecordResponse } from "cloudflare/resources/dns/records.mjs";
import { TableCell, TableRow } from "../ui/table";

interface HostItemProps {
  record: RecordResponse;
}

export default function HostItem({ record }: HostItemProps) {
  return (
    <TableRow>
      <TableCell className="w-[300px] overflow-scroll">{record.name}</TableCell>
      <TableCell className="break-all">{record.content}</TableCell>
    </TableRow>
  );
}
