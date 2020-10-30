import React from 'react'
import styled from 'styled-components'
import { themeGet } from '@styled-system/theme-get'
import { Link } from '@redwoodjs/router'

import { unlockBrowser } from 'src/web3/connect'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`

const StyledLink = styled(Link)`
  color: ${themeGet('colors.black')};
  padding: 0;
  height: fit-content;
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`

const WalletContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const Header = () => {
  const onConnect = () => {
    const { walletAddress } = unlockBrowser({
      debug: true,
    })
  }

  return (
    <Wrapper>
      <StyledLink to="/">Emanafte</StyledLink>
      <RightSection>
        <WalletContainer>
          <button className="rw-button" onClick={onConnect}>
            Connect wallet
          </button>
        </WalletContainer>
      </RightSection>
    </Wrapper>
  )
}

export default Header
