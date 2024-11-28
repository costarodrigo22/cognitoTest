import { dynamoClient } from "@/lib/dynamoClient";
import { response } from "@/utils/response";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;

    if (!userId) {
      return response(400, { error: "User not found" });
    }

    const params = {
      TableName: "Cart_v2",
      IndexName: "UserIdIndex",
      KeyConditionExpression: "UserId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
    };

    const command = new QueryCommand(params);
    const cartProducts = await dynamoClient.send(command);

    return response(200, { cart: cartProducts || [] });
  } catch (error) {
    return response(400, {
      message: "Error fetching cart.",
      error: error,
    });
  }
}
