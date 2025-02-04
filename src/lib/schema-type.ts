import { ProxyEndpoints } from "cloudflare/resources/zero-trust/gateway/proxy-endpoints.mjs";
import { z } from "zod";
import { RecordResponse } from "cloudflare/resources/dns/records.mjs";

export const TailflareStateSchema = z.object({
  cloudflareApiKey: z.string(),
  cloudflareApiEmail: z.string(),
  tailscaleApiKey: z.string(),
  tailnetOrganization: z.string(),
});

export type TailflareState = z.infer<typeof TailflareStateSchema>;

export const InformationSchema = z.object({
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
    subdomain: z
      .string()
      .refine(
        (val) =>
          val.split(".").length <= 1 && val[-1] !== "." && val[0] !== ".",
        {
          message:
            "Enter a valid subdomain. Currently only support up to 4th level. E.g. subsub.sub.domain.tld",
        }
      )
      .default(""),
  }),
});

export type Information = {
  tailscale: {
    hosts: string[];
  };
  cloudflare: {
    zones: { name: string; id: string }[];
    dnsRecords: RecordResponse[];
    selectedZone?: string;
  };
};

export const fieldMap: Record<string, keyof TailflareState> = {
  "tailscale-api-key": "tailscaleApiKey",
  "tailnet-organization": "tailnetOrganization",
  "cloudflare-api-key": "cloudflareApiKey",
  "cloudflare-api-email": "cloudflareApiEmail",
};
