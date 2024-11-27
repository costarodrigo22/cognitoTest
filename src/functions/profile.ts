import { cognitoClient } from "@/lib/cognitoClient";
import { response } from "@/utils/response";
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const command = new AdminGetUserCommand({
    Username: userId,
    UserPoolId: process.env.COGNITO_POOL_ID,
  });

  const { UserAttributes } = await cognitoClient.send(command);

  return response(200, { profile: UserAttributes });
}
