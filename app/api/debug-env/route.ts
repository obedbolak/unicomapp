// TEMPORARY DEBUG ROUTE — delete once auth works.
// Runs in the Edge runtime, the same place proxy.ts (middleware) runs.
export const runtime = "edge";

export async function GET() {
  return Response.json({
    runtime: "edge",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  });
}
