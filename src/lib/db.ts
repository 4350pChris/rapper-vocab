import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

let _client: DynamoDBDocumentClient | null = null

export const client = () => {
  if (_client === null) {
    _client = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: "eu-central-1",
        endpoint: import.meta.env.DEV ? "http://localhost:8000" : undefined,
        credentials: {
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
        }
      })
    )
  }
  return _client
}
