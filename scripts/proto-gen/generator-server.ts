import ts from "typescript";
import { RpcType, rpcs } from "@shared/protocol/rpc.config";
import { createModuleAccessType } from "./utils";

//
// Generate all server request handlers
//
export function generateServerNodes(): ts.NodeArray<ts.Statement> {
  const moduleImportStmts: ts.Statement[] = [
    // import express from "express"
    ts.factory.createImportDeclaration(
      undefined,   // modifiers
      ts.factory.createImportClause(
        undefined, // Phase modifiers
        expressId, // default name
        undefined, // as name
      ),
      ts.factory.createStringLiteral("express"),
    ),

    // import * as protocol from ".."
    ts.factory.createImportDeclaration(
      undefined,   // modifiers
      ts.factory.createImportClause(
        undefined, // Phase modifiers
        undefined, // default name
        ts.factory.createNamespaceImport(protocolId), // as name
      ),
      ts.factory.createStringLiteral(".."),
    ),

    // import * as HTTP from "@shared/httpStatus"
    ts.factory.createImportDeclaration(
      undefined,   // modifiers
      ts.factory.createImportClause(
        undefined, // Phase modifiers
        undefined, // default name
        ts.factory.createNamespaceImport(httpId), // as name
      ),
      ts.factory.createStringLiteral("@shared/httpStatus"),
    ),

    // import { ApplicationError } from "@server/error";
    ts.factory.createImportDeclaration(
      undefined,    // modifiers
      ts.factory.createImportClause(
        undefined, // Phase modifiers
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

  // export const router = express.Router()
  const routerDeclarationStmt: ts.Statement =
    ts.factory.createVariableStatement(
      ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            routerId,
            undefined,   // no "!" token
            undefined,   // type
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

  // Generate all handler functions
  return ts.factory.createNodeArray([
    ...moduleImportStmts,
    routerDeclarationStmt,
    ...rpcs.map(generateRpcHandlerStmt),
  ]);
}

//
// Generate one server RPC handler
//
function generateRpcHandlerStmt(rpc: RpcType): ts.Statement {

  //
  // Code executed when server receive the POST request
  //
  const routeHandlerStmts: ts.Statement[] = [];

  // Add check input type (if any)
  // if (!protocol.is<type>(request.body)) throw new ApplicationError(...)
  if (rpc.input) {
    routeHandlerStmts.push(
      ts.factory.createIfStatement(          // if (! protocol.is<Req>(input))
        ts.factory.createLogicalNot(         //     ! protocol.is<Req>(input)
          ts.factory.createCallExpression(   //       protocol.is<Req>(input)
            ts.factory.createPropertyAccessExpression(protocolId, "is" + rpc.input),
            undefined, // Type Arguments
            [ requestBodyExp ],
          ),
        ),
        // then throw new ApplicationError(...)
        ts.factory.createThrowStatement(
          ts.factory.createNewExpression(
            appErrorId,
            undefined,
            [
              httpStatusBadRequest,
              ts.factory.createStringLiteral("request is not an " + rpc.input + "!"),
            ],
          ),
        ),
      ),
    );
  }

  // Generate callback call expression
  const cbArgs: ts.Expression[] = [ requestId, responseId ];
  if (rpc.input) cbArgs.unshift(requestBodyExp);
  const cbCallExpr: ts.Expression = ts.factory.createCallExpression(cbId, undefined, cbArgs);

  // Add callback call and store result in contentId (if rpc.output)
  // Add return statement
  if (rpc.output) {
    routeHandlerStmts.push(
      ts.factory.createVariableStatement(
        undefined, // modifiers
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              contentId,
              undefined,  // ! token
              undefined,  // type
              cbCallExpr,
            ),
          ],
          ts.NodeFlags.Const,
        ),
      ),
      generateJsonOkStmt(
        (rpc.AllowUndefined)
          ? ts.factory.createBinaryExpression(
            contentId,
            ts.factory.createToken(ts.SyntaxKind.BarBarToken),
            ts.factory.createObjectLiteralExpression(),
          )
          : contentId,
      ),
    );
  } else {
    routeHandlerStmts.push(
      ts.factory.createExpressionStatement(cbCallExpr),
      generateJsonOkStmt(ts.factory.createObjectLiteralExpression()),
    );
  }

  // Create expressjs post call statement
  // router.post(<route>, (...) => routeHandlerStmts
  const postCallStmt: ts.Statement =
    ts.factory.createExpressionStatement(
      ts.factory.createCallExpression(
        routerPostExpr,
        undefined,     // type parameters
        [
          ts.factory.createStringLiteral(rpc.url),
          ts.factory.createArrowFunction(
            undefined, // Modifiers
            undefined, // type parameters
            generateEpressParameterDeclarations(),
            undefined, // Return type
            undefined, // =>
            // Function body
            ts.factory.createBlock(routeHandlerStmts, true),
          ),
        ],
      ),
    );

  // Generate main handle function
  // export function(cb(...) => Promise<Type>) { ... }
  return ts.factory.createFunctionDeclaration(
    ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
    undefined,  // asteriskToken
    ts.factory.createIdentifier(rpc.name),
    undefined,  // generic parameters
    [
      ts.factory.createParameterDeclaration(
        undefined,        // modifiers
        undefined,        // dotdotdot
        cbId,             // param name
        undefined,        // question token
        generateCbPrototypeTypeNode(rpc),
      ),
    ],
    undefined,  // return type
    ts.factory.createBlock([ postCallStmt ], true),
  );
}

//
// Generate the prototype of the callback function.
// returns: (input?, request: express.Request, response: express.Response) => <Type>
//
function generateCbPrototypeTypeNode(rpc: RpcType): ts.TypeNode {
  // Parameter types of the callback
  const parameters: ts.ParameterDeclaration[] =
    (rpc.input)
      ? [
        ts.factory.createParameterDeclaration(
          undefined, // modifiers
          undefined, // dotdotdot
          "input",   // param name
          undefined, // question token
          createModuleAccessType(protocolId, rpc.input),
        ),
        ...generateEpressParameterDeclarations(),
      ]
      : generateEpressParameterDeclarations();

  // callback return type
  let returnTypeNode: ts.TypeNode =
    (rpc.output)
      ? createModuleAccessType(protocolId, rpc.output)
      : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
  if (rpc.AllowUndefined) {
    returnTypeNode = ts.factory.createUnionTypeNode([
      returnTypeNode,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
    ]);
  }

  // callback signature
  return ts.factory.createFunctionTypeNode(
    [],              // type parameters
    parameters,      // parameters
    returnTypeNode,  // return type
  );
}

//
// Generate express function parameters
// returns: [ request: Request, response: Response ]
function generateEpressParameterDeclarations(): ts.ParameterDeclaration[] {
  return [
    ts.factory.createParameterDeclaration(
      undefined, // modifiers
      undefined, // dotdotdot
      requestId, // param name
      undefined, // question token
      createModuleAccessType(expressId, "Request"),
    ),
    ts.factory.createParameterDeclaration(
      undefined,   // modifiers
      undefined,   // dotdotdot
      responseId,  // param name
      undefined,   // question token
      createModuleAccessType(expressId, "Response"),
    ),
  ];
}

//
// generate response.status(HTTP.OK).json(object)
//
function generateJsonOkStmt(responseObjectExpr: ts.Expression): ts.Statement {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(responseId, "status"),
          undefined, // Type arguments
          [ httpStatusOk ],
        ),
        "json",
      ),
      undefined, // Type arguments
      [ responseObjectExpr ],
    ),
  );
}

const expressId = ts.factory.createIdentifier("express");
const protocolId = ts.factory.createIdentifier("protocol");
const httpId = ts.factory.createIdentifier("HTTP");
const routerId = ts.factory.createIdentifier("router");
const routerPostExpr = ts.factory.createPropertyAccessExpression(routerId, "post");
const requestId = ts.factory.createIdentifier("request");
const responseId = ts.factory.createIdentifier("response");
const requestBodyExp = ts.factory.createPropertyAccessExpression(requestId, "body");
const cbId = ts.factory.createIdentifier("cb");
const appErrorId = ts.factory.createIdentifier("ApplicationError");
const httpStatusOk = ts.factory.createIdentifier("HTTP.Status.Ok");
const httpStatusBadRequest = ts.factory.createIdentifier("HTTP.Status.BadRequest");
const contentId = ts.factory.createIdentifier("content");
