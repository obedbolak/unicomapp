// app/api/debug-env/route.ts
//
// Switched off. This was a temporary route used while setting up login; it
// reported whether the auth settings were present. Login works now, so it
// answers "not found" like any unknown address. You can delete this folder.

export function GET() {
  return new Response("Not found", { status: 404 });
}
