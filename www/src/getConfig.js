// import configJsonAll from "./auth_config.json";
import appConfigs from './utils/appconfig.json'
import axios from "axios";


export async function getConfig() {
  // Configure the audience here. By default, it will take whatever is in the config
  // (specified by the `audience` key) unless it's the default value of "YOUR_API_IDENTIFIER" (which
  // is what you get sometimes by using the Auth0 sample download tool from the quickstart page, if you
  // don't have an API).
  // If this resolves to `null`, the API page changes to show some helpful info about what to do
  // with the audience.

  let configJson = appConfigs?.auth0 || {};
  let stytch = appConfigs?.stytch || {};
    
  const audience =
    configJson.audience && configJson.audience !== "YOUR_API_IDENTIFIER"
      ? configJson.audience
      : null;

  return {
    domain: configJson.domain,
    clientId: configJson.clientId,
    ...(audience ? { audience } : null),
    stytchPublicToken: stytch?.publicToken,
  };
}