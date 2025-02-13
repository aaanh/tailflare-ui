const usageText = {
  tailnetOrg: <span>You can get your Tailnet organization name on this page, under the <b>Organization</b> section. <a href="https://login.tailscale.com/admin/settings/general">Link</a>.</span>,

  tailscaleApiKey: <span>API access token is needed to fetch your Tailnet devices and can be generated here. <a href="https://login.tailscale.com/admin/settings/keys">Link</a>.</span>,

  cloudflareEmail: <span>The email you use to log in to your Cloudflare dashboard and manage zones.</span>,

  cloudflareApiKey: <span>You can either use the Global API Key or generate an API token with the Zone.DNS permissions and All zones scope. <a href="https://dash.cloudflare.com/profile/api-tokens">Link</a>.</span>,

  subdomain: <span>The subdomain you want to organize your hosts. For example, <code>anguyen-1.engineering.aaanh.to</code> Generally, access control is handled by Tailscale ACLs, so subdomains on Cloudflare is only superficial.</span>
}

export default usageText