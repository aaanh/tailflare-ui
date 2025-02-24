import { useTailflare } from "@/contexts/tailflare-context";
import { fieldMap } from "@/lib/schema-type";
import { CheckCircle2, XCircle } from "lucide-react";

export function ApiKeyStatus() {
  const { credentials } = useTailflare();

  return (
    <div className="justify-center gap-2 grid grid-cols-2 lg:grid-cols-4 rounded-md text-center">
      {Object.entries(fieldMap).map(([label, key]) => (
        <div
          key={label}
          className="flex justify-center items-center gap-2 p-2 border rounded-md text-sm"
        >
          {credentials[key] ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="capitalize">{label.replace(/-/g, " ")}</span>
        </div>
      ))}
    </div>
  );
}
