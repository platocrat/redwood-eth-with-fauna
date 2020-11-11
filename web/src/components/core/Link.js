import React from 'react'
import styled from 'styled-components'
import { themeGet } from '@styled-system/theme-get'

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
export default Link
