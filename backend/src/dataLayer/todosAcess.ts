import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Types } from 'aws-sdk/clients/s3'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { createLogger } from "../utils/logger";

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('TodosAccess')


// TODO: Implement the dataLayer logic

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly S3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.S3_BUCKET_NAME) {
  }

  async getAllTodo(userId: string): Promise<TodoItem[]> {

    try {
    console.log('Getting all Todos');

    const params = {
      TableName: this.todoTable,
      KeyConditionExpression: '#userId = :userId',
      ExpressionAttributeNames: {
        "#userId": "userId"
        },
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };

    const result = await this.docClient.query(params).promise();
    console.log(result);
    const items = result.Items;
    return items as TodoItem[];
    } catch (error) {
        console.log(error.message);
    }
    }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
  try {
    console.log("Creating a new Todo");
    logger.info("creating a new Todo");
    
    const params = {
        TableName: this.todoTable,
        Item: todoItem
    };

    const result = await this.docClient.put(params).promise();
    console.log(result);

    return todoItem as TodoItem;
  } catch  (error) {
    console.log(error.message);
  }
  }

    async updateTodoItem(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {

    try {
        console.log("Updating a Todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
            ExpressionAttributeNames: {
                "#name": "name",
                "#dueDate": "dueDate",
                "#done": "done"
            }, 
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ReturnValues: "UPDATED_NEW"
        };

        const result = await this.docClient.update(params).promise();
        console.log(result);
        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    } catch (error) {
        console.log(error.message);
    }
  }
    
    async deleteTodoItem(todoId: string, userId: string): Promise<string> {

    try {
        console.log("Deleting a Todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        };

        const result = await this.docClient.delete(params).promise();
        console.log(result);

        return todoId;
    } catch (error) {
        console.log(error.message);
    }
}

    async generateUploadUrl(todoId: string): Promise<string> {
    try {
        console.log("Generating a presigned URL");

        const url = this.S3Client.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: 800,
        });
        console.log(url);

        return url as string;
    }
    catch (error) {
        console.log(error.message);
    }
}

}