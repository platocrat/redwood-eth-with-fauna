import { Link, routes } from '@redwoodjs/router'
import { Flash } from '@redwoodjs/web'
import styled from 'styled-components'
import { themeGet } from '@styled-system/theme-get'

import AuctionsLayout from 'src/layouts/AuctionsLayout'
import AuctionsCell from 'src/components/AuctionsCell'
import NewAuction from 'src/components/NewAuction'
import { Row, Column } from 'src/components/core/Grid'

const TextContainer = styled.div`
  min-width: 20rem;
  padding: ${themeGet('space.4')};
`
const HomePage = () => {
  return (
    <>
      <Row gap="10px">
        <Column>
          <TextContainer>
            <h2><i>Perpetual distribution of NFT-linked content</i></h2>
            <br />
            <h2>How Emanator works</h2>
            <p>Creators mint NFTs that auction copies of themselves</p>
            <p>Bidders must hold top position for specified win time to claim the NFT</p>
            <p>Settled auctions automatically mint a child NFT for auction</p> 
            <p>30% of auction revenue is shared among the previous winners via SuperFluid</p>
            <p>Creator receives all the revenue from the Generation 1 auction and 70% from the progeny auctions</p>
          </TextContainer>
          <div className="rw-scaffold">
            <Flash timeout={1000} />
            <header className="rw-header">
              <h1 className="rw-heading rw-heading-primary">Create an NFT</h1>
            </header>
            <main className="rw-main">
              <NewAuction />
            </main>
          </div>
        </Column>
        <Column sm="auto">
          <AuctionsLayout>
            <AuctionsCell />
          </AuctionsLayout>
        </Column>
      </Row>
    </>
  )
}

export default HomePage
