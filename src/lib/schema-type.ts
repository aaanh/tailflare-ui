import { z } from "zod";
import { RecordResponse } from "cloudflare/resources/dns/records.mjs";

export const CredentialsSchema = z.object({
  cloudflareApiKey: z.string(),
  cloudflareApiEmail: z.string(),
  tailscaleApiKey: z.string(),
  tailnetOrganization: z.string(),
});

export type Credentials = z.infer<typeof CredentialsSchema>;

export const SubdomainSchema = z
  .string()
  .refine(
    (val) => val.split(".").length <= 1 && val[-1] !== "." && val[0] !== ".",
    {
      message:
        "Enter a valid subdomain. Currently only support up to 5th level FQDN. E.g. anguyen-workstation.engineering.laptops.aaanh.com",
    }
  )
  .default("");

export type Subdomain = z.infer<typeof SubdomainSchema>;

export const AppDataSchema = z.object({
  tailscale: z.object({
    hosts: z.array(z.string()),
  }),
  cloudflare: z.object({
    zones: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    ),
    dnsRecords: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        content: z.string(),
        ttl: z.number(),
        created_on: z.string().datetime(),
        modified_on: z.string().datetime(),
        proxied: z.boolean(),
        proxiable: z.boolean(),
      })
    ),
    subdomain: SubdomainSchema,
  }),
});

export type AppData = {
  tailscale: {
    hosts: string[];
  };
  cloudflare: {
    zones: { name: string; id: string }[];
    dnsRecords: RecordResponse[];
    selectedZone?: { id: string; name: string };
    subdomain: string;
  };
};

export const fieldMap: Record<string, keyof Credentials> = {
  "tailscale-api-key": "tailscaleApiKey",
  "tailnet-organization": "tailnetOrganization",
  "cloudflare-api-key": "cloudflareApiKey",
  "cloudflare-api-email": "cloudflareApiEmail",
};
