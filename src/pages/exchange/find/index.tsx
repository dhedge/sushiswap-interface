import { Currency, JSBI, Ether, CurrencyAmount, Token } from '@sushiswap/sdk'
import { PairState, useV2Pair } from '../../../hooks/useV2Pairs'
import React, { useCallback, useEffect, useState } from 'react'
import { Trans, t } from '@lingui/macro'
import Alert from '../../../components/Alert'
import { AutoColumn } from '../../../components/Column'
import { AutoRow } from '../../../components/Row'
import CurrencySelectPanel from '../../../components/CurrencySelectPanel'
import Dots from '../../../components/Dots'
import { FindPoolTabs } from '../../../components/NavigationTabs'
import Head from 'next/head'
import Link from 'next/link'
import { MinimalPositionCard } from '../../../components/PositionCard'
import { Plus } from 'react-feather'
import Web3Connect from '../../../components/Web3Connect'
import { currencyId } from '../../../functions/currency'
import { useActiveWeb3React } from '../../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import { usePairAdder } from '../../../state/user/hooks'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { ExtendedEther } from '../../../constants'

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

export default function PoolFinder() {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()

  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

  const [currency0, setCurrency0] = useState<Currency | null>(() => (chainId ? ExtendedEther.onChain(chainId) : null))
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = useV2Pair(currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.quotient, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.quotient, JSBI.BigInt(0))
    )

  const position: CurrencyAmount<Token> | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)

  const hasPosition = Boolean(position && JSBI.greaterThan(position.quotient, JSBI.BigInt(0)))

  // const switchTokens = useCallback(() => {
  //   setCurrency0(currency1);
  //   setCurrency1(currency0);
  // }, [currency0, currency1]);

  // const handleCurrencySelect = useCallback(
  //   (currency: Currency) => {
  //     if (activeField === Fields.TOKEN0) {
  //       if (currency === currency1) switchTokens();
  //       else setCurrency0(currency);
  //     } else {
  //       if (currency === currency0) switchTokens();
  //       else setCurrency1(currency);
  //     }
  //   },
  //   [activeField, currency0, currency1, switchTokens]
  // );

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField]
  )

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false)
  }, [setShowSearch])

  const prerequisiteMessage = (
    <div className="p-5 text-center rounded bg-dark-800">{i18n._(t`Select a token to find your liquidity`)}</div>
  )

  return (
    <>
      <Head>
        <title>{i18n._(t`Find Pool`)} | Sushi</title>
        <meta name="description" content="Find pool" />
      </Head>
      <div className="relative w-full max-w-2xl rounded bg-dark-900 shadow-liquidity">
        <FindPoolTabs />
        <div className="p-4 space-y-6">
          <Alert
            showIcon={false}
            message={
              <Trans>
                <b>Tip:</b> Use this tool to find pairs that don&apos;t automatically appear in the interface
              </Trans>
            }
            type="information"
          />

          <AutoColumn gap={'md'}>
            <CurrencySelectPanel
              currency={currency0}
              onClick={() => setActiveField(Fields.TOKEN0)}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={currency1}
              id="pool-currency-input"
            />
            <AutoColumn justify="space-between">
              <AutoRow justify={'flex-start'} style={{ padding: '0 1rem' }}>
                <button className="z-10 -mt-6 -mb-6 rounded-full bg-dark-900 p-3px">
                  <div className="p-3 rounded-full bg-dark-800 hover:bg-dark-700">
                    <Plus size="32" />
                  </div>
                </button>
              </AutoRow>
            </AutoColumn>
            <CurrencySelectPanel
              currency={currency1}
              onClick={() => setActiveField(Fields.TOKEN1)}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={currency0}
              id="pool-currency-output"
            />
          </AutoColumn>

          {hasPosition && (
            <AutoRow
              style={{
                justifyItems: 'center',
                backgroundColor: '',
                padding: '12px 0px',
                borderRadius: '12px',
              }}
              justify={'center'}
              gap={'0 3px'}
            >
              {i18n._(t`Pool Found!`)}
              <Link href={`/pool`}>
                <a className="text-center">{i18n._(t`Manage this pool`)}</a>
              </Link>
            </AutoRow>
          )}

          {currency0 && currency1 ? (
            pairState === PairState.EXISTS ? (
              hasPosition && pair ? (
                <MinimalPositionCard pair={pair} border="1px solid #CED0D9" />
              ) : (
                <div className="p-5 rounded bg-dark-800">
                  <AutoColumn gap="sm" justify="center">
                    {i18n._(t`You don’t have liquidity in this pool yet`)}
                    <Link href={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                      <a className="text-center text-blue text-opacity-80 hover:text-opacity-100">
                        {i18n._(t`Add liquidity`)}
                      </a>
                    </Link>
                  </AutoColumn>
                </div>
              )
            ) : validPairNoLiquidity ? (
              <div className="p-5 rounded bg-dark-800">
                <AutoColumn gap="sm" justify="center">
                  {i18n._(t`No pool found`)}
                  <Link href={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                    <a className="text-center">{i18n._(t`Create pool`)}</a>
                  </Link>
                </AutoColumn>
              </div>
            ) : pairState === PairState.INVALID ? (
              <div className="p-5 text-center rounded bg-dark-800">{i18n._(t`Invalid pair`)}</div>
            ) : pairState === PairState.LOADING ? (
              <div className="p-5 text-center rounded bg-dark-800">
                <Dots>{i18n._(t`Loading`)}</Dots>
              </div>
            ) : null
          ) : !account ? (
            <Web3Connect className="w-full" size="lg" color="blue" />
          ) : (
            prerequisiteMessage
          )}
        </div>
      </div>
    </>
  )
}
