import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";

import { bodyParser } from "@/utils/bodyParser";
import { response } from "@/utils/response";
import { cognitoClient } from "@/lib/cognitoClient";

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const body = bodyParser(event.body);

    const command = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: body.email,
    });

    await cognitoClient.send(command);

    return response(204);
  } catch (error) {
    return response(500, {
      error: "Internal server error.",
    });
  }
}
