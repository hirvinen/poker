import Layout from '../components/Layout'
import Poker from '../components/Poker'
import Head from 'next/head'

const Index = () => (
  <div>
    <Head>
      <link rel="stylesheet" type="text/css" href="/static/styles/poker.css" />
    </Head>
    <Layout title="Play Quick Poker">
      <Poker />
    </Layout>
  </div>
)

export default Index