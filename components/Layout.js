import Header from './Header'
import Head from 'next/head'

const Layout = (props) => (
  <div className="layout">
    <Head>
      <title>{props.title}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="stylesheet" type="text/css" href="/static/styles/common.css" />
    </Head>
    <Header/>
    {props.children}
  </div>
)

export default Layout
