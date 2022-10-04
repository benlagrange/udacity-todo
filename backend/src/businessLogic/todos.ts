import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from "../models/TodoUpdate";
import { parseUserId } from '../auth/utils';

// TODO: Implement businessLogic
const uuidv4 = require('uuid/v4');
const todosAccess = new TodosAccess()

export async function getTodosForUser(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);
    return todosAccess.getAllTodo(userId);
}

export async function createTodoItem(jwtToken: string, request: CreateTodoRequest): Promise<TodoItem> {
    const userId= parseUserId(jwtToken);
    const todoId = uuidv4()
    const createdAt = new Date().getTime.toString()
    const todoBucketName = process.env.S3_BUCKET_NAME

    return await todosAccess.createTodo({
        userId: userId,
        todoId: todoId,
        attachmentUrl:  `https://${todoBucketName}.s3.amazonaws.com/${todoId}`,
        createdAt: createdAt,
        done: false,
        ...request,
    });

}

export async function updateTodoItem(jwtToken: string, todoId: string, request: UpdateTodoRequest): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken);
    return todosAccess.updateTodoItem(userId, todoId, request);
}

export async function deleteTodoItem(jwtToken: string, todoId: string): Promise<string> {
    const userId = parseUserId(jwtToken);
    return todosAccess.deleteTodoItem(userId, todoId);
}


export async function generateUploadUrl(todoId: string): Promise<string> {
    return todosAccess.generateUploadUrl(todoId)
}