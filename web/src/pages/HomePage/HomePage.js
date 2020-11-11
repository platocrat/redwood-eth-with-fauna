import { Link, routes } from '@redwoodjs/router'
import { Flash } from '@redwoodjs/web'
import styled from 'styled-components'
import { themeGet } from '@styled-system/theme-get'

import AuctionsLayout from 'src/layouts/AuctionsLayout'
import AuctionsCell from 'src/components/AuctionsCell'
import NewAuction from 'src/components/NewAuction'
import { Row, Column } from 'src/components/core/Grid'

const TextContainer = styled.div`
  padding: ${themeGet('space.4')};
`
const HomePage = () => {
  return (
    <>
      <Row gap="10px">
        <Column>
          <TextContainer>
            <h1>How Emanator works</h1>
            <p>Perpetual distribution</p>
            <p>Start real time SuperFluid auctions</p>
          </TextContainer>
          <div className="rw-scaffold">
            <Flash timeout={1000} />
            <header className="rw-header">
              <h1 className="rw-heading rw-heading-primary">
                Create your own NFT
              </h1>
            </header>
            <main className="rw-main">
              <NewAuction />
            </main>
          </div>
        </Column>
        <Column>
          <AuctionsLayout>
            <AuctionsCell />
          </AuctionsLayout>
        </Column>
      </Row>
    </>
  )
}

export default HomePage
