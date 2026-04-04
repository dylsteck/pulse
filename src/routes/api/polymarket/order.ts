import { createFileRoute } from '@tanstack/react-router'
import { createHmac } from 'crypto'

const CLOB_HOST = 'https://clob.polymarket.com'

function buildPolyHmacSignature(
  secret: string,
  timestamp: string,
  method: string,
  requestPath: string,
  body?: string,
): string {
  let message = timestamp + method + requestPath
  if (body !== undefined) {
    message += body
  }

  const base64Secret = Buffer.from(secret, 'base64')
  const hmac = createHmac('sha256', base64Secret)
  const sig = hmac.update(message).digest('base64')

  // URL-safe base64
  return sig.replace(/\+/g, '-').replace(/\//g, '_')
}

export const Route = createFileRoute('/api/polymarket/order')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { signedOrder, credentials } = body

          if (!signedOrder || !credentials) {
            return Response.json(
              { error: 'Missing signedOrder or credentials' },
              { status: 400 },
            )
          }

          // Map numeric side to string
          const sideString = signedOrder.side === 0 ? 'BUY' : 'SELL'

          const orderPayload = {
            order: {
              salt: parseInt(signedOrder.salt, 10),
              maker: signedOrder.maker,
              signer: signedOrder.signer,
              taker: signedOrder.taker,
              tokenId: signedOrder.tokenId,
              makerAmount: signedOrder.makerAmount,
              takerAmount: signedOrder.takerAmount,
              side: sideString,
              expiration: signedOrder.expiration,
              nonce: signedOrder.nonce,
              feeRateBps: signedOrder.feeRateBps,
              signatureType: signedOrder.signatureType,
              signature: signedOrder.signature,
            },
            owner: credentials.key,
            orderType: 'GTC',
          }

          const timestamp = Math.floor(Date.now() / 1000).toString()
          const method = 'POST'
          const path = '/order'
          const bodyString = JSON.stringify(orderPayload)

          const signature = buildPolyHmacSignature(
            credentials.secret,
            timestamp,
            method,
            path,
            bodyString,
          )

          const response = await fetch(`${CLOB_HOST}/order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              POLY_ADDRESS: signedOrder.maker,
              POLY_API_KEY: credentials.key,
              POLY_PASSPHRASE: credentials.passphrase,
              POLY_TIMESTAMP: timestamp,
              POLY_SIGNATURE: signature,
            },
            body: bodyString,
          })

          // Handle geo-blocking (returns HTML)
          const contentType = response.headers.get('content-type') || ''
          if (!contentType.includes('application/json')) {
            const text = await response.text()
            if (text.includes('<!DOCTYPE') || text.includes('<html')) {
              return Response.json(
                {
                  error:
                    'Request blocked - likely geo-restriction. Polymarket blocks certain regions.',
                },
                { status: 403 },
              )
            }
            return Response.json(
              { error: `Unexpected response: ${text.substring(0, 100)}` },
              { status: response.status },
            )
          }

          const data = await response.json()

          if (!response.ok) {
            return Response.json(
              {
                error:
                  data.error || data.message || 'Order submission failed',
                details: data,
              },
              { status: response.status },
            )
          }

          return Response.json(data)
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Order submission failed',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
