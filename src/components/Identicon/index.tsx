import React, { useEffect, useRef } from 'react'

import Jazzicon from 'jazzicon'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'

const StyledIdenticonContainer = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  background-color: ${({ theme }) => theme.bg4};
`

export default function Identicon() {
  const ref = useRef<HTMLDivElement>()

  const { account } = useActiveWeb3React()

  useEffect(() => {
    if (typeof window !== undefined && account && ref.current) {
      ref.current.innerHTML = ''
      // ref.current.appendChild(Jazzicon(16, parseInt(account.slice(2, 10), 16)))
    }
  }, [account])

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
  return <StyledIdenticonContainer ref={ref as any} />
}
