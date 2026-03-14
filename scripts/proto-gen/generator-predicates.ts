import ts from "typescript";
import { ProtocolObject, ObjectContentMap, Types } from "./types";
import { createModuleAccessType } from "./utils";
import { parseError } from "./error";

export function generatePredicateFileNodes(
  objectList: ProtocolObject[],
) {
  const moduleImport = ts.factory.createImportDeclaration(
    undefined, // modifier
    ts.factory.createImportClause(
      undefined, // Phase modifier
      undefined, // default name
      ts.factory.createNamespaceImport(ts.factory.createIdentifier("protocol")),
    ),
    ts.factory.createStringLiteral("../types"),
  );
  return ts.factory.createNodeArray([ moduleImport, ...generatePredicatesStmts(objectList) ]);
}

// Generate predicate function for each object in objectList
function generatePredicatesStmts(
  objectList: ProtocolObject[],
): ts.Statement[] {
  const statements: ts.Statement[] = [];
  objectList.forEach((object) => {
    statements.push(generatePredicateStmt(object.name, object.content));
  });
  return statements;
}

//
// Generate a predicate function for the given object
//
function generatePredicateStmt(
  objectName: string,
  objectContent: ObjectContentMap,
): ts.Statement {
  const objectTypeNode = createModuleAccessType(protocolId, objectName);

  const predicateFuncDeclaration = ts.factory.createFunctionDeclaration(
    ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
    undefined,  // asteriskToken
    ts.factory.createIdentifier("is" + objectName),
    undefined,  // generic parameters
    [
      ts.factory.createParameterDeclaration(
        undefined,  // Modifiers
        undefined,  // dotDotDotToken
        objectId,   // Param name
        undefined,  // Question tocken
        anyKeyword, // Type
        undefined,  // Default value
      ),
    ],
    ts.factory.createTypePredicateNode(
      undefined,               // Assert Modifier
      objectId,                // Parameter name
      objectTypeNode,          // "is" type
    ),
    // Function body
    ts.factory.createBlock(
      [
        ...generateCheckObjectStmts(objectId, objectContent),
        ts.factory.createReturnStatement(ts.factory.createTrue()),
      ],
      true, // multi-line (for generation)
    ),
  );

  return predicateFuncDeclaration;
}

//
// Generate check statements for an object content
//
function generateCheckObjectStmts(
  objectExpression: ts.Expression,           // Object to check
  objectContent: ObjectContentMap,  // Object content
): ts.Statement[] {
  const stmtResults: ts.Statement[] = [];

  objectContent.forEach((value, key) => {
    const subobjectExpression =
      ts.factory.createPropertyAccessExpression(objectExpression, key);
    const checkTypeStmts: ts.Statement[] = [];

    // Simple type cases
    if ([
      Types.Number,
      Types.BigInt,
      Types.String,
      Types.Boolean,
    ]
      .includes(value.type)) {

      // array case
      if (value.isArray) {
        // Check type is an array
        checkTypeStmts.push(ts.factory.createIfStatement(
          ts.factory.createLogicalNot(
            ts.factory.createBinaryExpression(
              subobjectExpression,
              ts.factory.createToken(ts.SyntaxKind.InstanceOfKeyword),
              arrayId,
            ),
          ),
          returnFalseStmt,
        ));

        // Check ourArray.every((element) => typeof element === <expected type>)
        checkTypeStmts.push(ts.factory.createIfStatement(
          ts.factory.createLogicalNot(
            ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(subobjectExpression, "every"),
              undefined, // Type Arguments
              [
                ts.factory.createArrowFunction(
                  undefined, // modifiers
                  undefined, // type parameters
                  [
                    ts.factory.createParameterDeclaration(
                      undefined,  // modifiers
                      undefined,  // DotDotDotToken
                      elementId,
                      undefined,  // question token
                      anyKeyword, // type
                    ),
                  ],
                  ts.factory.createTypeReferenceNode("boolean"), // return type
                  undefined, // => (default value)
                  ts.factory.createBinaryExpression(
                    ts.factory.createTypeOfExpression(elementId),
                    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    ts.factory.createStringLiteral(Types[value.type].toLowerCase()),
                  ),
                ),
              ],
            ),
          ),
          returnFalseStmt,
        ));

      } else {  // non-array case, check type is the expected one
        checkTypeStmts.push(genrareExpectJSTypeStmt(
          subobjectExpression,
          Types[value.type].toLowerCase(),
        ));
      }
    } else if (value.type === Types.Enum) {
      // Enum case
      // Check type
      checkTypeStmts.push(genrareExpectJSTypeStmt(
        subobjectExpression,
        "number",
      ));
      // Check value belows to enum
      checkTypeStmts.push(ts.factory.createIfStatement(
        ts.factory.createLogicalNot(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(tsObjectId, "values"),
                undefined, // Type Arguments
                [
                  ts.factory.createPropertyAccessExpression(protocolId, value.enumName!),
                ],
              ),
              "includes",
            ),
            undefined, // Type Arguments
            [ subobjectExpression ],
          ),
        ),
        returnFalseStmt,
      ));
    } else if (value.type === Types.Object) {
      // object type.
      const objectStmts: ts.Statement[] = [
        genrareExpectJSTypeStmt(
          subobjectExpression,
          "object",
        ),
        ...generateCheckObjectStmts(subobjectExpression, value.object!),
      ];
      // We add a block only for look & feel
      if (!value.optional) {
        checkTypeStmts.push(ts.factory.createBlock(objectStmts));
      } else {
        checkTypeStmts.push(...objectStmts);
      }
    } else {
      parseError(key, "Type not yet implemented: " + value.type);
    }

    if (value.optional) {
      stmtResults.push(generateIfNotEqualsStmt(
        subobjectExpression,
        undefinedId,
        ts.factory.createBlock(checkTypeStmts),
      ));
    } else {
      stmtResults.push(...checkTypeStmts);
    }
  });
  return stmtResults;
}

//
// Return an if statement that return false if expr has an invalid javascript type
//
function genrareExpectJSTypeStmt(objectExpression: ts.Expression, type: string): ts.Statement {
  return generateIfNotEqualsStmt(
    ts.factory.createTypeOfExpression(objectExpression),
    ts.factory.createStringLiteral(type),
    returnFalseStmt,
  );
}

//
// Return if(left === right) body;
//
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function generateIfEqualsStmt(left: ts.Expression, right: ts.Expression, body: ts.Statement): ts.Statement {
  return ts.factory.createIfStatement(
    ts.factory.createBinaryExpression(
      left,
      ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
      right,
    ),
    body,
  );
}

//
// Return if(left !== right) body;
//
function generateIfNotEqualsStmt(left: ts.Expression, right: ts.Expression, body: ts.Statement): ts.Statement {
  return ts.factory.createIfStatement(
    ts.factory.createBinaryExpression(
      left,
      ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
      right,
    ),
    body,
  );
}

//
// Helper constants
//
const objectId = ts.factory.createIdentifier("object");
const undefinedId = ts.factory.createIdentifier("undefined");
const anyKeyword = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
const arrayId = ts.factory.createIdentifier("Array");
const returnFalseStmt = ts.factory.createReturnStatement(ts.factory.createFalse());
const elementId = ts.factory.createIdentifier("element");
const tsObjectId = ts.factory.createIdentifier("Object");
const protocolId = ts.factory.createIdentifier("protocol");
