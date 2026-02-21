import ts from "typescript";

export function createModuleAccessType(module: ts.Expression, member: string): ts.TypeNode {
  return ts.factory.createExpressionWithTypeArguments(             // How to do this correctly ?
    ts.factory.createPropertyAccessExpression(module, member),
    [],
  );
}
