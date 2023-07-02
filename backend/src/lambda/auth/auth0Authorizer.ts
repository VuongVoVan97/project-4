import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode} from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')
var jwksClient = require('jwks-rsa');

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-7fcqep1xwpym2eb3.us.auth0.com/.well-known/jwks.json'

var client = jwksClient({
  jwksUri: jwksUrl
});
async function getKey(jwtKid) {
  let key
  try {
    key = await client.getSigningKey(jwtKid)
  } catch (e) {
    logger.error(e.message)
    throw new Error('Unexpected get JWT error')
  }
  let signingKey = key.publicKey || key.rsaPublicKey;
  return signingKey
}

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}
async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const jwtKid = jwt.header.kid;
  let result = jwt.payload
  logger.info("Plain JWT: " + jwt.payload)
  try {
    let decodedJwtPayload = verify(token, await getKey(jwtKid))
    if (decodedJwtPayload['sub'] != result.sub
    || decodedJwtPayload['iss'] != result.iss
    || decodedJwtPayload['iat'] != result.iat
    || decodedJwtPayload['exp'] != result.exp
    ) {
      logger.error('Incorrect JWT token')
      throw new Error('Incorrect JWT token')
    }
  } catch (e) {
    logger.error(e.message)
    throw new Error('Invalid JWT token')
  }
  return result
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')
  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')
  const split = authHeader.split(' ')
  const token = split[1]
  return token
}