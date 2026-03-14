import ts from "typescript";
import { RpcType, rpcs } from "@shared/protocol/rpc.config";
import { createModuleAccessType } from "./utils";

export function generateClientNodes(): ts.NodeArray<ts.Statement> {
  const moduleImportStmts: ts.Statement[] = [
    // import * as protocol from "..";
    ts.factory.createImportDeclaration(
      undefined, // modifier
      ts.factory.createImportClause(
        undefined, // Phase modifier
        undefined, // default name
        ts.factory.createNamespaceImport(protocolId),
      ),
      ts.factory.createStringLiteral(".."),
    ),

    // import { post } from "@client/protocol/request";
    ts.factory.createImportDeclaration(
      undefined,   // modifier
      ts.factory.createImportClause(
        undefined, // Phase modifier
        undefined, // default name
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            postId,
          ),
        ]),
      ),
      ts.factory.createStringLiteral("@client/protocol/request"),
    ),
  ];

  // Generate all RPC requests
  return ts.factory.createNodeArray([
    ...moduleImportStmts,
    ...rpcs.map(generateRpcRequest),
  ]);
}

//
// Generate one RPC request
//
function generateRpcRequest(rpc: RpcType): ts.Statement {
  // Statements executed one sucess response received
  const postThenStmts: ts.Statement[] = [];
  if (rpc.output) {
    if (rpc.AllowUndefined) {
      postThenStmts.push(
        // if (Object.keys(output).length === 0) return undefined
        ts.factory.createIfStatement(
          ts.factory.createLogicalNot(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(objectId, "keys"),
                undefined,
                [ outputId ],
              ),
              "length",
            ),
          ),
          ts.factory.createReturnStatement(ts.factory.createIdentifier("undefined")),
        ),
      );
    }
    // if (!protocol.is<Resp>(output)) throw Error(...)
    postThenStmts.push(
      ts.factory.createIfStatement(
        ts.factory.createLogicalNot(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(protocolId, "is" + rpc.output),
            undefined, // Type Arguments
            [ outputId ],
          ),
        ),
        ts.factory.createThrowStatement(
          ts.factory.createNewExpression(
            ts.factory.createIdentifier("Error"),
            undefined,
            [
              ts.factory.createStringLiteral("response is not an " + rpc.output + "!"),
            ],
          ),
        ),
      ));
    postThenStmts.push(ts.factory.createReturnStatement(outputId));
  } else {
    postThenStmts.push(ts.factory.createReturnStatement());
  }

  // Function provided to post success reply
  const postThenExpr: ts.Expression =
    ts.factory.createArrowFunction(
      undefined, // modifiers
      undefined, // type parameters
      (rpc.output)
        ? [
          ts.factory.createParameterDeclaration(
            undefined,  // modifiers
            undefined,  // DotDotDotToken
            outputId, // Param name
            undefined,  // question token
            undefined,  // type
          ),
        ]
        : [],
      undefined, // Return type
      undefined, // => (arrow function)
      // body
      ts.factory.createBlock(
        postThenStmts,
        true, // multi-line (for generation)
      ),
    );

  // Call post(...).then(responseFunction)
  const postExpr: ts.Expression =
    ts.factory.createCallExpression(              // post(...).then()
      ts.factory.createPropertyAccessExpression(  // post(...).then
        ts.factory.createCallExpression(          // post(...)
          postId,
          undefined, // Type Arguments
          [
            ts.factory.createStringLiteral("/api" + rpc.url),
            (rpc.input)
              ? inputId
              : ts.factory.createObjectLiteralExpression(),
          ],
        ),
        "then",
      ),
      undefined,        // Types Argument
      [ postThenExpr ], // Arguments
    );

  // Main function parameters
  const parameters: ts.ParameterDeclaration[] =
    (rpc.input)
      ? [
        ts.factory.createParameterDeclaration(
          undefined,                                        // Modifiers
          undefined,                                        // dotDotDotToken
          inputId,                                          // Parameter name
          undefined,                                        // Question token
          createModuleAccessType(protocolId, rpc.input),    // Type
          undefined,                                        // Default value
        ),
      ]
      : [];

  // Main function return type
  const returnType: ts.TypeReferenceNode =
    ts.factory.createTypeReferenceNode(
      "Promise",
      [
        (rpc.output)
          ? (rpc.AllowUndefined)
            ? ts.factory.createUnionTypeNode([
              createModuleAccessType(protocolId, rpc.output),
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
            ])
            : createModuleAccessType(protocolId, rpc.output)
          : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
      ],
    );

  // Main function
  return ts.factory.createFunctionDeclaration(
    ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export | ts.ModifierFlags.Async),
    undefined,  // asteriskToken
    ts.factory.createIdentifier(rpc.name),
    undefined,  // generic parameters
    parameters,
    returnType,
    // Function body
    ts.factory.createBlock([ ts.factory.createReturnStatement(postExpr) ], true),
  );

}

const protocolId = ts.factory.createIdentifier("protocol");
const postId = ts.factory.createIdentifier("post");
const inputId = ts.factory.createIdentifier("input");
const outputId = ts.factory.createIdentifier("output");
const objectId = ts.factory.createIdentifier("Object");
