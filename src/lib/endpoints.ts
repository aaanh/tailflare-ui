export class Tailscale {
  #tailnetOrganization: string;

  constructor(tailnetOrganization: string) {
    this.#tailnetOrganization = tailnetOrganization;
  }

  async getEndpoint() {
    return {
      devices: `https://api.tailscale.com/api/v2/tailnet/${
        this.#tailnetOrganization
      }/devices`,
    };
  }
}
