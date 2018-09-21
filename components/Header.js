import Link from 'next/link'

const Header = () => (
  <div className="navigation">
  <Link href="/">
    <a>Play</a>
  </Link>
  <Link href="/about">
    <a>About and instructions</a>
  </Link>
  </div>
)

export default Header
