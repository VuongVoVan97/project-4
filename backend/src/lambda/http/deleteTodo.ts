import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'

import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    let userId: string = getUserId(event)
    let result = await deleteTodo(todoId, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        result
      }),
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  }
)