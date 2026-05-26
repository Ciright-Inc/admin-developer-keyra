import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="ds-app-footer">
      <div className="ds-app-footer__inner">
        <Link href="/dashboard" className="ds-app-footer__brand" aria-label="KEYRA Global Admin">
          <img
            src="/assets/keyra_logo_hz_black.png"
            alt=""
            className="ds-app-footer__logo ds-app-footer__logo--light"
          />
          <img
            src="/assets/keyra_logo_hz_white.png"
            alt=""
            className="ds-app-footer__logo ds-app-footer__logo--dark"
          />
        </Link>
        <p className="ds-app-footer__copy">
          &copy; {new Date().getFullYear()} KEYRA · Global Admin
        </p>
      </div>
    </footer>
  );
}
