import Link from 'next/link'

const Header = () => (
  <div>
  <Link href="/">
    <a className="navigation">Play</a>
  </Link>
  <Link href="/about">
    <a className="navigation">About and instructions</a>
  </Link>
  </div>
)

export default Header
