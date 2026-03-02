import ts from "typescript";
import { RpcType, rpcs } from "@shared/protocol/rpc.config";
import { createModuleAccessType } from "./utils";

export function generateServerNodes() {
  const moduleImports = [
    ts.factory.createImportDeclaration(
      undefined,   // modifier
      ts.factory.createImportClause(
        undefined, // Phase modifier
        expressId, // default name
        undefined, // as name
      ),
      ts.factory.createStringLiteral("express"),
    ),
    ts.factory.createImportDeclaration(
      undefined,   // modifier
      ts.factory.createImportClause(
        undefined, // Phase modifier
        undefined, // default name
        ts.factory.createNamespaceImport(protocolId), // as name
      ),
      ts.factory.createStringLiteral(".."),
    ),
    ts.factory.createImportDeclaration(
      undefined,   // modifier
      ts.factory.createImportClause(
        undefined, // Phase modifier
        undefined, // default name
        ts.factory.createNamespaceImport(httpId), // as name
      ),
      ts.factory.createStringLiteral("@shared/httpStatus"),
    ),
    ts.factory.createImportDeclaration(
      undefined, // modifier
      ts.factory.createImportClause(
        undefined, // Phase modifier
        undefined, // default name
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            appErrorId,
          ),
        ]),
      ),
      ts.factory.createStringLiteral("@server/error"),
    ),
  ];

  const routerDeclaration =
    ts.factory.createVariableStatement(
      ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            routerId,
            undefined,  // ! tocken
            undefined,  // type
            ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(expressId, "Router"),
              undefined, // Type arguments
              [ ],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

  return ts.factory.createNodeArray([ ...moduleImports, routerDeclaration, ...rpcs.map(generateRpcReply) ]);
}

function generateRpcReply(rpc: RpcType) {
  const cbArgsDeclaration = (rpc.request)
    ? [
      ts.factory.createParameterDeclaration(
        undefined, // modifiers
        undefined, // dotdotdot
        "request", // param name
        undefined, // question tocket
        createModuleAccessType(protocolId, rpc.request),
      ),
    ]
    : [];

  const postCbStmts: ts.Statement[] = (rpc.request)
    ? [
      ts.factory.createIfStatement( // if (!protocol.is<Req>(request))
        ts.factory.createLogicalNot( // ! protocol.is<Req>(request)
          ts.factory.createCallExpression( // protocol.is<Req>(request)
            ts.factory.createPropertyAccessExpression(protocolId, "is" + rpc.request),
            undefined, // Type Arguments
            [ reqBodyId ],
          ),
        ),
        // then
        ts.factory.createThrowStatement( // Throw new ApplicationError(badRequest, msg)
          ts.factory.createNewExpression(
            appErrorId,
            undefined,
            [
              httpStatusBadRequest,
              ts.factory.createStringLiteral("request is not an " + rpc.request + "!"),
            ],
          ),
        ),
      ),

      ts.factory.createVariableStatement(
        undefined, // modifiers
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              contentId,
              undefined,  // ! tocken
              undefined,  // type
              ts.factory.createCallExpression(
                cbId,
                undefined, // Type arguments
                [ reqBodyId ],
              ),
            ),
          ],
          ts.NodeFlags.Const,
        ),
      ),
      generateReplyOk([ contentId ]),
    ]
    : [
      ts.factory.createExpressionStatement(
        ts.factory.createCallExpression(
          cbId,
          undefined, // Type arguments
          [ ],
        ),
      ),
      generateReplyOk([ ts.factory.createObjectLiteralExpression() ]),
    ];


  return ts.factory.createFunctionDeclaration(
    ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
    undefined,  // asteriskToken
    ts.factory.createIdentifier(rpc.requestName),
    undefined,  // generic parameters
    [
      ts.factory.createParameterDeclaration(
        undefined,        // modifiers
        undefined,        // dotdotdot
        cbId,             // param name
        undefined,        // question tocket
        ts.factory.createFunctionTypeNode(
          undefined,      // type parameters
          cbArgsDeclaration,
          (rpc.response)  // return type
            ? createModuleAccessType(protocolId, rpc.response)
            : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        ),
      ),
    ],
    undefined,  // return type
    // Function body
    ts.factory.createBlock([
      ts.factory.createExpressionStatement(
        ts.factory.createCallExpression(
          routerPostId,
          undefined,    // type paramaters
          [
            ts.factory.createStringLiteral(rpc.url),
            ts.factory.createArrowFunction(
              undefined, // Modifiers
              undefined, // type parameters
              [
                ts.factory.createParameterDeclaration(
                  undefined, // modifiers
                  undefined, // dotdotdot
                  (rpc.request) ? reqId : "_req",
                  undefined, // question tocket
                  createModuleAccessType(expressId, "Request"),
                ),
                ts.factory.createParameterDeclaration(
                  undefined, // modifiers
                  undefined, // dotdotdot
                  resId, // param name
                  undefined, // question tocket
                  createModuleAccessType(expressId, "Response"),
                ),
              ],
              undefined, // Return type
              undefined, // =>
              // Function body
              ts.factory.createBlock(postCbStmts, true),
            ),
          ],
        ),
      ),
    ], true),
  );
}

function generateReplyOk(argumentsArray: ts.Expression[]): ts.Statement {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(resId, "status"),
          undefined, // Type aruments
          [ httpStatusOk ],
        ),
        "json",
      ),
      undefined, // Type aruments
      argumentsArray,
    ),
  );
}

const expressId = ts.factory.createIdentifier("express");
const protocolId = ts.factory.createIdentifier("protocol");
const httpId = ts.factory.createIdentifier("HTTP");
const routerId = ts.factory.createIdentifier("router");
const routerPostId = ts.factory.createPropertyAccessExpression(routerId, "post");
const reqId = ts.factory.createIdentifier("req");
const resId = ts.factory.createIdentifier("res");
const reqBodyId = ts.factory.createPropertyAccessExpression(reqId, "body");
const cbId = ts.factory.createIdentifier("cb");
const appErrorId = ts.factory.createIdentifier("ApplicationError");
const httpStatusOk = ts.factory.createIdentifier("HTTP.Status.Ok");
const httpStatusBadRequest = ts.factory.createIdentifier("HTTP.Status.BadRequest");
const contentId = ts.factory.createIdentifier("content");
