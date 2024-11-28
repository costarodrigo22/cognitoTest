import { dynamoClient } from "@/lib/dynamoClient";
import { response } from "@/utils/response";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;

    if (!userId) {
      return response(400, { error: "User not found" });
    }

    const { productId, quantity, price } = JSON.parse(event.body || "{}");

    if (!productId || !quantity || !price) {
      return response(400, { error: "Missing product details" });
    }

    const cartId = uuidv4();

    const params = {
      TableName: "Cart_v2",
      Item: {
        CartId: { S: cartId }, // Identificador único para o item do carrinho
        UserId: { S: userId }, // Associando o carrinho ao UserId
        ProductId: { S: productId }, // ID do produto
        Quantity: { N: quantity.toString() }, // Quantidade do produto
        Price: { N: price.toString() }, // Preço do produto
        CreatedAt: { S: new Date().toISOString() }, // Data de criação
      },
    };

    const command = new PutItemCommand(params);
    await dynamoClient.send(command);

    return response(201, {
      message: "Item added to cart successfully",
      cartId,
    });
  } catch (error) {
    return response(400, {
      message: "Error fetching cart.",
      error: error,
    });
  }
}
