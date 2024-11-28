import { dynamoClient } from "@/lib/dynamoClient";
import { response } from "@/utils/response";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const cartId = event.pathParameters?.cartId;
    const body = JSON.parse(event.body || "{}");
    const { quantity } = body;

    if (!userId) {
      return response(400, { error: "User not found" });
    }

    if (!cartId) {
      return response(400, { error: "Product is required." });
    }

    if (!quantity || quantity <= 0) {
      return response(400, {
        error: "Quantity must be a valid number greater than 0.",
      });
    }

    const params = {
      TableName: "Cart_v2",
      Key: {
        CartId: { S: cartId },
        UserId: { S: userId },
      },
      UpdateExpression: "SET Quantity = :quantity",
      ExpressionAttributeValues: {
        ":quantity": { N: quantity.toString() },
      },
    };

    const command = new UpdateItemCommand(params);
    const result = await dynamoClient.send(command);

    return response(200, {
      message: "Quantity updated successfully",
      updatedItem: result,
    });
  } catch (error) {
    return response(400, { message: "Error fetching cart.", error });
  }
}
