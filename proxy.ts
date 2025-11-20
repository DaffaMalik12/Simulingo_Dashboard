import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  console.log("PATH:", pathname);
  console.log("SESSION:", session ? "ADA" : "TIDAK ADA");

  const isAuthPage = pathname === "/auth/login";
  console.log("isAuthPage:", isAuthPage);

  if (isAuthPage && session) {
    console.log("REDIRECT to /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthPage && !session) {
    console.log("REDIRECT to /auth/login");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
