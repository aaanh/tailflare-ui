import { useTailflare } from "@/contexts/tailflare-context";
import { fieldMap } from "@/lib/schema-type";
import { CheckCircle2, XCircle } from "lucide-react";

export function ApiKeyStatus() {
  const { tailflareState } = useTailflare();

  return <div className="grid lg:grid-cols-4 grid-cols-2 rounded-md text-center justify-center gap-2">
    {Object.entries(fieldMap).map(([label, key]) => (
      <div key={label} className="flex items-center gap-2 justify-center border p-2 rounded-md text-sm">
        {tailflareState[key] ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <span className="capitalize">
          {label.replace(/-/g, ' ')}
        </span>
      </div>
    ))}
  </div>
}