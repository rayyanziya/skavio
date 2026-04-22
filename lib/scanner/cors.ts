import type { CheckResult } from "@/types";

export function checkCors(headers: Headers): CheckResult[] {
  const results: CheckResult[] = [];

  const acao = headers.get("access-control-allow-origin");
  const acac = headers.get("access-control-allow-credentials");

  if (!acao) {
    results.push({
      id: "cors-wildcard",
      name: "CORS Configuration",
      category: "CORS",
      status: "pass",
      severity: "high",
      description: "No overly permissive CORS headers detected on the main page.",
    });
    return results;
  }

  if (acao === "*" && acac?.toLowerCase() === "true") {
    results.push({
      id: "cors-credentials-wildcard",
      name: "CORS: Wildcard Origin with Credentials",
      category: "CORS",
      status: "fail",
      severity: "critical",
      description:
        "CORS is configured to allow any origin (*) AND allow credentials. This is a critical misconfiguration that lets any website make authenticated requests to your API on behalf of your users.",
      affectedValue: `Access-Control-Allow-Origin: ${acao}, Access-Control-Allow-Credentials: ${acac}`,
    });
  } else if (acao === "*") {
    results.push({
      id: "cors-wildcard",
      name: "CORS: Wildcard Origin",
      category: "CORS",
      status: "warn",
      severity: "medium",
      description:
        "CORS allows any origin (*). This is acceptable for public APIs but dangerous if this endpoint serves authenticated data.",
      affectedValue: `Access-Control-Allow-Origin: *`,
    });
  } else {
    results.push({
      id: "cors-restricted",
      name: "CORS Configuration",
      category: "CORS",
      status: "pass",
      severity: "high",
      description: `CORS is restricted to specific origin(s): ${acao}`,
      affectedValue: acao,
    });
  }

  return results;
}
