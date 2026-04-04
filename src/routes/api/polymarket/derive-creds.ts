import { createFileRoute } from '@tanstack/react-router'

const CLOB_HOST = 'https://clob.polymarket.com'

export const Route = createFileRoute('/api/polymarket/derive-creds')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { address, signature, timestamp, nonce } = await request.json()

          const headers: Record<string, string> = {
            Accept: '*/*',
            'Content-Type': 'application/json',
            POLY_ADDRESS: address,
            POLY_SIGNATURE: signature,
            POLY_TIMESTAMP: timestamp.toString(),
            POLY_NONCE: nonce.toString(),
          }

          // Try to derive existing credentials first
          const deriveResponse = await fetch(
            `${CLOB_HOST}/auth/derive-api-key`,
            { method: 'GET', headers },
          )

          if (deriveResponse.ok) {
            const creds = await deriveResponse.json()
            return Response.json({
              success: true,
              apiKey: creds.apiKey,
              secret: creds.secret,
              passphrase: creds.passphrase,
            })
          }

          // If derive fails, create new credentials
          const createResponse = await fetch(`${CLOB_HOST}/auth/api-key`, {
            method: 'POST',
            headers,
          })

          if (!createResponse.ok) {
            const error = await createResponse.text()
            return Response.json(
              {
                success: false,
                error: 'Failed to create API credentials',
                message: error,
              },
              { status: 500 },
            )
          }

          const creds = await createResponse.json()
          return Response.json({
            success: true,
            apiKey: creds.apiKey,
            secret: creds.secret,
            passphrase: creds.passphrase,
          })
        } catch (error) {
          return Response.json(
            {
              success: false,
              error: 'Failed to derive credentials',
              message:
                error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
