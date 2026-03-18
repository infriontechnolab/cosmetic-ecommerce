import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED = ["/account", "/checkout"];
const AUTH_PAGES = ["/sign-in", "/sign-up"];
const ADMIN = "/admin";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;

  const isProtected = PROTECTED.some((p) => nextUrl.pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => nextUrl.pathname.startsWith(p));
  const isAdmin = nextUrl.pathname.startsWith(ADMIN);

  // Admin route guard — check email against ADMIN_EMAILS env var
  if (isAdmin) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const userEmail = session?.user?.email?.toLowerCase() ?? "";
    if (!isLoggedIn || !adminEmails.includes(userEmail)) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isProtected && !isLoggedIn) {
    const url = new URL("/sign-in", nextUrl);
    url.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/account", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)" ],
};
