import { useQuery } from '@tanstack/react-query'
import { createPublicClient, http, erc20Abi } from 'viem'
import { base, polygon } from 'wagmi/chains'

const chains = { [base.id]: base, [polygon.id]: polygon } as const

export function useErc20Balance(
  chainId: number,
  tokenAddress: `0x${string}`,
  userAddress: `0x${string}` | undefined,
  options?: { refetchInterval?: number },
) {
  return useQuery({
    queryKey: ['erc20-balance', chainId, tokenAddress, userAddress],
    queryFn: async () => {
      if (!userAddress) return 0n
      const chain = chains[chainId as keyof typeof chains]
      if (!chain) throw new Error(`Unsupported chain: ${chainId}`)
      const client = createPublicClient({ chain, transport: http() })
      return client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress],
      })
    },
    enabled: !!userAddress,
    refetchInterval: options?.refetchInterval ?? 30_000,
    staleTime: 15_000,
  })
}
