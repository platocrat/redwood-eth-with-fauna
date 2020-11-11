import React from 'react'
import styled from 'styled-components'

import { themeGet } from '@styled-system/theme-get'
import { navigate, routes } from '@redwoodjs/router'

import { unlockBrowser } from 'src/web3/connect'

const Container = styled.header`
  position: relative;
  width: 100%;
  padding: ${themeGet('space.4')};
  background-color: ${themeGet('colors.bg')};
  display: flex;
  align-items: center;
`

const Link = styled.button.attrs((props) => ({
  onClick: props.onClick,
}))`
  cursor: ${({ asText }) => !asText && `pointer`};
  font-style: normal;
  font-weight: ${themeGet('fontWeights.medium')};
  font-size: 16px;
  font-family: ${themeGet('fonts.base')};
  background-color: ${themeGet('colors.transparent')};
  color: ${themeGet('colors.black')};
  border: none;
  outline: none;
  margin-left: 0;
  padding-left: 0;
  position: relative;
  transition: all 0.15s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    opacity: 0.8;
  }

  @media (min-width: ${themeGet('breakpoints.xl')}) {
    font-size: 18px;
  }
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`

const Header = () => {
  const onConnect = () => {
    const { walletAddress } = unlockBrowser({
      debug: true,
    })
  }

  return (
    <Container>
      <Link onClick={() => navigate(routes.home())}>Emanator</Link>
      <RightSection>
        <button className="rw-button" onClick={onConnect}>
          Connect wallet
        </button>
      </RightSection>
    </Container>
  )
}

export default Header
