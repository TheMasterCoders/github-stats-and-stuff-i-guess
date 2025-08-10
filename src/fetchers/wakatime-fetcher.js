import axios from "axios";
import { CustomError, MissingParamError } from "../common/utils.js";

/**
 * WakaTime data fetcher.
 *
 * @param {{username: string, api_domain: string }} props Fetcher props.
 * @returns {Promise<WakaTimeData>} WakaTime data response.
 */
const fetchWakatimeStats = async ({ username, api_domain }) => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  // Allow-list of permitted WakaTime API domains
  const ALLOWED_API_DOMAINS = ["wakatime.com", "wakatime.dev"];

  // Helper to sanitize and validate the api_domain
  function getAllowedApiDomain(domain) {
    if (!domain) return "wakatime.com";
    // Remove protocol, port, and path, only keep hostname
    try {
      // If domain includes protocol, use URL to parse, else prepend protocol for parsing
      const url = domain.match(/^https?:\/\//)
        ? new URL(domain)
        : new URL("https://" + domain);
      const hostname = url.hostname.replace(/\/$/gi, "");
      if (ALLOWED_API_DOMAINS.includes(hostname)) {
        return hostname;
      }
    } catch (e) {
      // If parsing fails, fall through to default
    }
    return "wakatime.com";
  }

  try {
    const safeApiDomain = getAllowedApiDomain(api_domain);
    const { data } = await axios.get(
      `https://${safeApiDomain}/api/v1/users/${encodeURIComponent(username)}/stats?is_including_today=true`,
    );

    return data.data;
  } catch (err) {
    if (err.response && (err.response.status < 200 || err.response.status > 299)) {
      throw new CustomError(
        `Could not resolve to a User with the login of '${username}'`,
        "WAKATIME_USER_NOT_FOUND",
      );
    }
    throw err;
  }
};

export { fetchWakatimeStats };
export default fetchWakatimeStats;
