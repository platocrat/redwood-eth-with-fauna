import { Link, routes } from '@redwoodjs/router'
import AuctionsLayout from 'src/layouts/AuctionsLayout'
import AuctionsCell from 'src/components/AuctionsCell'

const HomePage = () => {
  return (
    <>
      <h1>HomePage</h1>
      <p>
        Find me in <code>./web/src/pages/HomePage/HomePage.js</code>
      </p>
      <p>
        My default route is named <code>home</code>, link to me with `
        <Link to={routes.home()}>Home</Link>`
      </p>
      <AuctionsLayout>
        <AuctionsCell />
      </AuctionsLayout>
    </>
  )
}

export default HomePage
