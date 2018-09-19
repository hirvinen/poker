import Link from 'next/link'

const linkStyle = {
  marginRight: 15
}

const Header = () => (
  <div>
  <Link href="/">
  <a style={linkStyle}>Play</a>
  </Link>
  <Link href="/about">
    <a style={linkStyle}>About and instructions</a>
  </Link>
  </div>
)

export default Header
