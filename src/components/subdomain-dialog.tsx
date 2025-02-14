import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTailflare } from "@/contexts/tailflare-context";
import { InformationSchema } from "@/lib/schema-type";

export function SubdomainDialog() {
  const { information, setInformation } = useTailflare();
  const [subdomain, setSubdomain] = useState(
    information.cloudflare.subdomain || ""
  );
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate the subdomain using the schema
      InformationSchema.shape.cloudflare.shape.subdomain.parse(subdomain);

      // Update the information context with the new subdomain
      setInformation({
        ...information,
        cloudflare: {
          ...information.cloudflare,
          subdomain,
        },
      });

      setError(null);
      setEditing(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <div>
      {editing ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-4 border p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span>{`<hostname>`}.</span>
            <Input
              id="subdomain"
              value={subdomain}
              onChange={(e) => {
                setSubdomain(e.target.value);
                setError(null);
              }}
              placeholder="subdomain"
              className={error ? "border-red-500" : ""}
            />
            <span>.{information.cloudflare.selectedZone?.name}</span>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <Button type="submit">Save</Button>
        </form>
      ) : (
        <Button
          variant="outline"
          size={"lg"}
          className="group relative flex items-center gap-2"
          onClick={() => setEditing(true)}
        >
          <span>
            {information.cloudflare.selectedZone
              ? `Current target subdomain: ${[
                  "<hostname>",
                  information.cloudflare.subdomain,
                  information.cloudflare.selectedZone.name,
                ]
                  .filter((str) => str.length > 0)
                  .join(".")}`
              : "Choose Cloudflare zone and enter subdomain"}
          </span>
          <Pencil
            className="opacity-0 group-hover:opacity-100 w-4 h-4 transition-opacity"
            aria-hidden="true"
          />
        </Button>
      )}
    </div>
  );
}
