import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private readonly documentClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly logger = createLogger('TodosAccess')
  ) {}

  async getTodosForUser(userId: string) {
    this.logger.info(`Get ToDo items for user ${userId}`)
    const items = await this.documentClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    let result = items.Items
    return result as TodoItem[]
  }

  async createTodosForUser(newTodoItem: TodoItem, userId: string) {
    this.logger.info(`Create new ToDo items for user ${userId}`)
    await this.documentClient
      .put({
        TableName: this.todosTable,
        Item: newTodoItem
      })
      .promise()

    return newTodoItem
  }

  async updateTodosForUser(
    updateTodoItem: TodoUpdate,
    todoId: string,
    userId: string
  ) {
    this.logger.info(`Try to update ToDo item ${todoId} for user ${userId}`)

    if (!this.getTodosForUserWithTodoId(userId, todoId)) {
      this.logger.error(`Todo item id is not exist for user ${userId}`)
      throw new Error(`Not found todo item id for user ${userId}`)
    }

    this.logger.info(`Begin update ToDo items for user ${userId}`)

    await this.documentClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'SET #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': updateTodoItem.name,
          ':dueDate': updateTodoItem.dueDate,
          ':done': updateTodoItem.done
        }
      })
      .promise()
  }

  async deleteTodosForUser(todoId: string, userId: string) {
    this.logger.info(`Delete ToDo item ${todoId} for user ${userId}`)
    await this.documentClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()
  }

  async generateUploadUrl(
    attachmentUrl: string,
    todoId: string,
    userId: string
  ) {
    this.logger.info(`Try to update ToDo item ${todoId} for user ${userId}`)

    if (!this.getTodosForUserWithTodoId(userId, todoId)) {
      this.logger.error(`Todo item id is not exist for user ${userId}`)
      throw new Error(`Not found todo item id for user ${userId}`)
    }

    this.logger.info(`Begin update ToDo items for user ${userId}`)

    await this.documentClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'SET #attachmentUrl = :attachmentUrl',
        ExpressionAttributeNames: {
          '#attachmentUrl': 'attachmentUrl'
        },
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
  }

  private async getTodosForUserWithTodoId(userId: string, todoId: string) {
    this.logger.info(`Get ToDo items for user ${userId} with todoId ${todoId}`)
    const items = await this.documentClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':todoId': todoId
        }
      })
      .promise()

    let result = false
    if (items.Items.length > 0) {
      result = true
    }
    return result
  }
}
