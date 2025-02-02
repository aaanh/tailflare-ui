import { z } from "zod";

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
  }),
});

export type Information = z.infer<typeof InformationSchema>;
