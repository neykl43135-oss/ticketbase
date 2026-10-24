type TurnstileResult = {
  success?: boolean;
  action?: string;
  hostname?: string;
};

export async function verifyTurnstile(
  token: unknown,
  expectedAction: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET?.trim();

  const allowedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean),
  );

  if (
    !secret ||
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 2048 ||
    allowedHostnames.size === 0
  ) {
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret,
          response: token,
        }),
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      },
    );

    if (!response.ok) return false;

    const result = (await response.json()) as TurnstileResult;

    return (
      result.success === true &&
      result.action === expectedAction &&
      typeof result.hostname === "string" &&
      allowedHostnames.has(result.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}
