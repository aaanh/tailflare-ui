import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTailflare } from "@/contexts/tailflare-context";
import { InformationSchema } from "@/lib/schema-type";

export function SubdomainDialog() {
  const { information, setInformation } = useTailflare();
  const [subdomain, setSubdomain] = useState(information.cloudflare.subdomain || "");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
      setOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="group relative flex items-center gap-2"
        >
          <span>
            {information.cloudflare.subdomain && information.cloudflare.selectedZone
              ? `Current target subdomain: <hostname>.${information.cloudflare.subdomain}.${information.cloudflare.selectedZone.name}`
              : "Set subdomain"}
          </span>
          <Pencil
            className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Subdomain</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="subdomain"
              value={subdomain}
              onChange={(e) => {
                setSubdomain(e.target.value);
                setError(null);
              }}
              placeholder="Enter subdomain"
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog >
  );
} 