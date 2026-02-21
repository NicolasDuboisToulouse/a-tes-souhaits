import ts from "typescript";
import { RpcType, rpcs } from "@shared/protocol/rpc.config";
import { createModuleAccessType } from "./utils";

export function generateClientNodes() {
  const moduleImports = [
    ts.factory.createImportDeclaration(
      undefined, // modifier
      ts.factory.createImportClause(
        undefined, // Phase modifier
        undefined, // default name
        ts.factory.createNamespaceImport(protocolId),
      ),
      ts.factory.createStringLiteral(".."),
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
            postId,
          ),
        ]),
      ),
      ts.factory.createStringLiteral("@client/protocol/request"),
    ),
  ];
  return ts.factory.createNodeArray([ ...moduleImports, ...rpcs.map(generateRpcRequest) ]);
}


function generateRpcRequest(rpc: RpcType) {

  const parameters: ts.ParameterDeclaration[] =
    (rpc.request)
      ? [
        ts.factory.createParameterDeclaration(
          undefined,                                        // Modifiers
          undefined,                                        // dotDotDotToken
          requestId,                                        // Parameter name
          undefined,                                        // Question token
          createModuleAccessType(protocolId, rpc.request),  // Type
          undefined,                                        // Default value
        ),
      ]
      : [];

  const returnType = ts.factory.createTypeReferenceNode(
    "Promise",
    [
      (rpc.response)
        ? createModuleAccessType(protocolId, rpc.response)
        : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
    ],
  );

  const thenStmts = (rpc.response)
    ? [
      ts.factory.createIfStatement( // if (!protocol.is<Resp>(response))
        ts.factory.createLogicalNot( // ! protocol.is<Resp>(response)
          ts.factory.createCallExpression( // protocol.is<Resp>(response)
            ts.factory.createPropertyAccessExpression(protocolId, "is" + rpc.response),
            undefined, // Type Arguments
            [ responseId ],
          ),
        ),
        // then
        ts.factory.createThrowStatement( // Throw new Error(msg)
          ts.factory.createNewExpression(
            ts.factory.createIdentifier("Error"),
            undefined,
            [
              ts.factory.createStringLiteral("response is not an " + rpc.response + "!"),
            ],
          ),
        ),
      ),
      ts.factory.createReturnStatement(responseId),
    ]
    : [
      ts.factory.createReturnStatement(),
    ];


  const responseFunction = ts.factory.createArrowFunction(
    undefined, // modifiers
    undefined, // type parameters
    (rpc.response)
      ? [
        ts.factory.createParameterDeclaration(
          undefined,  // modifiers
          undefined,  // DotDotDotToken
          responseId, // Param name
          undefined,  // question token
          undefined,  // type
        ),
      ]
      : [],
    undefined, // Return type
    undefined, // => (arrow function)
    // body
    ts.factory.createBlock(
      thenStmts,
      true, // multi-line (for generation)
    ),
  );

  return ts.factory.createFunctionDeclaration(
    ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export | ts.ModifierFlags.Async),
    undefined,  // asteriskToken
    ts.factory.createIdentifier(rpc.requestName),
    undefined,  // generic parameters
    parameters,
    returnType,
    // Function body
    ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          ts.factory.createCallExpression(              // post(...).then()
            ts.factory.createPropertyAccessExpression(  // post(...).then
              ts.factory.createCallExpression(          // post(...)
                postId,
                undefined, // Type Arguments
                [
                  ts.factory.createStringLiteral("/api" + rpc.url),
                  (rpc.request)
                    ? requestId
                    : ts.factory.createObjectLiteralExpression(),
                ],
              ),
              "then",
            ),
            undefined, // Type Argument
            [ responseFunction ], // Arguments
          ),
        ),
      ],
      true, // multi-line (for generation)
    ),
  );

}

const protocolId = ts.factory.createIdentifier("protocol");
const postId = ts.factory.createIdentifier("post");
const requestId = ts.factory.createIdentifier("request");
const responseId = ts.factory.createIdentifier("response");
