import * as fetch from "node-fetch";
import Webflow from "webflow-api";

// TODO: We should update our API Client so that any requests that fail with a 403 status code
// to inform the user that they should check to ensure they authorized the user for the correct scopes.

export async function getAPIClient(ctx, beta = true) {
  const payload = await strapi
    .plugin("users-permissions")
    .service("jwt")
    .getToken(ctx);

  if (!ctx.request.header["authorization"] || !payload) {
    throw new Error(`Unauthorized access`);
  }

  return new Webflow({
    token: payload.webflow_token,
    version: beta ? "2.0.0" : "1.0.0",
    host: beta ? "webflow.com/beta" : "webflow.com",
  });
}

export function getPublicAPIClient(access_token, beta = true) {
  return new Webflow({
    token: access_token,
    version: beta ? "2.0.0" : "1.0.0",
    host: beta ? "webflow.com/beta" : "webflow.com",
  });
}

export async function revokeToken(access_token, client_id, client_secret) {
  try {
    const response = await fetch(
      "https://api.webflow.com/oauth/revoke_authorization",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: access_token,
          client_id: client_id,
          client_secret: client_secret,
        }),
      }
    );

    return response?.data;
  } catch (error) {
    console.log(error);
  }
}

const ALL_SCOPES = [
  "assets:read",
  "assets:write",
  "authorized_user:read",
  "cms:read",
  "cms:write",
  "custom_code:read",
  "custom_code:write",
  "forms:read",
  "forms:write",
  "pages:read",
  "pages:write",
  "sites:read",
  "sites:write",
];

function getScope() {
  const SCOPES = [
    "authorized_user:read",
    "cms:read",
    "cms:write",
    "sites:read",
  ];
  return SCOPES;
}

export function createAuthUrl(client_id: string, scope: string[]) {
  const webflow = new Webflow();
  return webflow.authorizeUrl({
    scope: scope.join(" "),
    client_id: client_id,
    state: client_id,
  });
}

/**
 * Retrieves an access token from the Webflow API using an authorization code.
 *
 * Since we're getting the access token from the server in our middleware, we need to use the node-fetch package
 * instead of the browser fetch API. This is because the browser fetch API is not available in
 * the server runtime. See the following 2 links:
 * https://nextjs.org/docs/messages/node-module-in-edge-runtime
 * https://nextjs.org/docs/api-reference/edge-runtime
 *
 * @param {string} code - An authorization code previously obtained from Webflow.
 * @returns {Promise<string>} - A promise that resolves to the access token string.
 * @throws {Error} - If the API request fails or the response cannot be parsed.
 */
export async function getAccessToken(ctx, code, client_id, client_secret) {
  try {
    const response = await fetch("https://api.webflow.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
        grant_type: "authorization_code",
        client_id: client_id,
        client_secret: client_secret,
      }),
    });
    if (!response.ok) {
      return response;
    }
    const data: any = await response.json();
    // Return the access token string from the response data object.
    return data.access_token;
  } catch (error) {
    return ctx.internalServerError(error);
  }
}
