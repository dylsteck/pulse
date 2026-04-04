import type { LocalAccount } from 'viem'
import { CLOB_HOST } from '@/lib/wagmi'
import { makeRequest } from '@/lib/request'

export interface ClobCredentials {
  key: string
  secret: string
  passphrase: string
}

const STORAGE_KEY = 'poly_api_creds'

export function getStoredCredentials(
  address: string,
): ClobCredentials | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(
      `${STORAGE_KEY}_${address.toLowerCase()}`,
    )
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function storeCredentials(
  address: string,
  creds: ClobCredentials,
): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    `${STORAGE_KEY}_${address.toLowerCase()}`,
    JSON.stringify(creds),
  )
}

export function clearCredentials(address: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`${STORAGE_KEY}_${address.toLowerCase()}`)
}

export async function buildL1AuthSignature(
  viemAccount: LocalAccount,
  timestamp: number,
  nonce: number,
): Promise<string> {
  const domain = {
    name: 'ClobAuthDomain',
    version: '1',
    chainId: 137,
  } as const

  const types = {
    ClobAuth: [
      { name: 'address', type: 'address' },
      { name: 'timestamp', type: 'string' },
      { name: 'nonce', type: 'uint256' },
      { name: 'message', type: 'string' },
    ],
  } as const

  const message = {
    address: viemAccount.address,
    timestamp: timestamp.toString(),
    nonce,
    message: 'This message attests that I control the given wallet',
  }

  return viemAccount.signTypedData({
    domain,
    types,
    primaryType: 'ClobAuth',
    message,
  })
}

export async function deriveApiCredentials(
  viemAccount: LocalAccount,
): Promise<ClobCredentials> {
  const timestamp = Math.floor(Date.now() / 1000)
  const nonce = 0

  const signature = await buildL1AuthSignature(viemAccount, timestamp, nonce)

  const data = await makeRequest<{
    success: boolean
    apiKey: string
    secret: string
    passphrase: string
    message?: string
  }>('/api/polymarket/derive-creds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: viemAccount.address,
      signature,
      timestamp,
      nonce,
    }),
  })

  if (!data.success) {
    throw new Error(data.message || 'Failed to derive API credentials')
  }

  return {
    key: data.apiKey,
    secret: data.secret,
    passphrase: data.passphrase,
  }
}

export async function getOrDeriveCredentials(
  viemAccount: LocalAccount,
): Promise<ClobCredentials> {
  const stored = getStoredCredentials(viemAccount.address)
  if (stored) return stored

  const creds = await deriveApiCredentials(viemAccount)
  storeCredentials(viemAccount.address, creds)
  return creds
}
