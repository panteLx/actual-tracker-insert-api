import { Issuer } from "openid-client";
import { config } from "./config.js";

const OIDC_Issuer = await Issuer.discover(config.oidc.issuer);
const client = new OIDC_Issuer.Client({
  client_id: config.oidc.clientId,
  client_secret: config.oidc.clientSecret,
  redirect_uris: [config.oidc.appUrl + "/auth/callback"],
  response_types: ["code"],
});

export { client };
