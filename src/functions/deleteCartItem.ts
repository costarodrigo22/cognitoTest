import { dynamoClient } from "@/lib/dynamoClient";
import { response } from "@/utils/response";
import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;

    const cartId = event.pathParameters?.cartId;

    if (!userId || !cartId) {
      return response(400, { error: "User not found." });
    }

    const params = {
      TableName: "Cart_v2",
      Key: {
        CartId: { S: cartId },
        UserId: { S: userId },
      },
    };

    const command = new DeleteItemCommand(params);
    await dynamoClient.send(command);

    return response(200, { message: "Item deleted successfully" });
  } catch (error) {
    return response(500, {
      message: "Error deleting item from cart.",
      error: error,
    });
  }
}
