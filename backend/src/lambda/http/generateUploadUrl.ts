import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createPresignedUrl } from '../../helpers/attachmentUtils'
import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import * as uuid from 'uuid'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    let userId: string = getUserId(event)
    let attachmentId = uuid.v4()
    let presignedUrl = await createPresignedUrl(attachmentId)
    await createAttachmentPresignedUrl(todoId, attachmentId, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        'uploadUrl': presignedUrl
      }),
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  }
)
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )