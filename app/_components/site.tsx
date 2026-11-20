import Link from "next/link";

export function Nav() {
  return (
    <div className="wrap nav">
      <Link href="/" className="logo">
        Lets<span>Chat</span>
      </Link>
      <nav>
        <a href="/#how" className="hide-sm">How it works</a>
        <a href="/#pricing" className="hide-sm">Pricing</a>
        <Link href="/login">Log in</Link>
        <Link href="/signup" className="btn small">Start now</Link>
      </nav>
    </div>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div>
          <strong>LetsChat</strong> by Dleading Creative Designs Ltd
          <br />
          13 Sefton Avenue, Leeds LS11 7BA
        </div>
        <div className="links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="https://www.creativedleading.co.uk">Dleading</a>
        </div>
      </div>
    </footer>
  );
}
