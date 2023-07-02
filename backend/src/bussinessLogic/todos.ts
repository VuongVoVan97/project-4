import { TodosAccess } from '../dataLayer/todosAcess'
import { getUploadUrl } from '../helpers/attachmentUtils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const todosAccess = new TodosAccess()
const logger = createLogger('TodosAccess')

// TODO: Implement businessLogic
export async function getTodosForUser(userId: string) {
  return await todosAccess.getTodosForUser(userId)
}

export async function createTodo(newTodo: CreateTodoRequest, userId: string) {
  let currentData = new Date()
  logger.info('Begin createTodo...')
  return await todosAccess.createTodosForUser(
    {
      todoId: uuid.v4(),
      userId: userId,
      createdAt: currentData.toISOString(),
      name: newTodo.name,
      dueDate: newTodo.dueDate,
      done: false
    },
    userId
  )
}

export async function updateTodo(
  updateTodo: UpdateTodoRequest,
  todoId: string,
  userId: string
) {
  return await todosAccess.updateTodosForUser(
    {
      name: updateTodo.name,
      dueDate: updateTodo.dueDate,
      done: updateTodo.done
    },
    todoId,
    userId
  )
}

export async function deleteTodo(todoId: string, userId: string) {
  return await todosAccess.deleteTodosForUser(todoId, userId)
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  attachmentId: string,
  userId: string
) {
  let attachmentUrl = await getUploadUrl(attachmentId)
  return await todosAccess.generateUploadUrl(attachmentUrl, todoId, userId)
}
