import { Link, routes } from '@redwoodjs/router'
import AuctionsLayout from 'src/layouts/AuctionsLayout'
import AuctionsCell from 'src/components/AuctionsCell'

const HomePage = () => {
  return (
    <>
      <AuctionsLayout>
        <AuctionsCell />
      </AuctionsLayout>
    </>
  )
}

export default HomePage
