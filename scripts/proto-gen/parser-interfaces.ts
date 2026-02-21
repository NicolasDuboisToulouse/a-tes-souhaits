import ts from "typescript";
import path from "path";
import * as logger from "@shared/logger";
import * as protoGen from ".";

//
// Parse protocol definition file and return a protocol Object list
//
export function parseInterfaces(protocolTypeFilePath: string): protoGen.Object[] {

  const program = createProgram([ protocolTypeFilePath ]);
  const protocolDefFile = program.getSourceFile(protocolTypeFilePath);
  if (!protocolDefFile) logger.die("Cannot read", logger.quote(protocolTypeFilePath), "!");
  const typeChecker = program.getTypeChecker();

  const interfaces: protoGen.Object[] = [];
  ts.forEachChild(protocolDefFile, (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      if (
        node.modifiers &&
        node.modifiers.find((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        const nodeType = typeChecker.getTypeAtLocation(node);
        interfaces.push({
          name: node.name.text,
          content: parseObjectContent(nodeType, typeChecker, node.name.text),
        });
      }
    }
  });
  return interfaces;
}

//
// Create program for sourceFiles using project tsconfig.json
//
function createProgram(sourceFiles: string[]): ts.Program {
  const host: ts.ParseConfigFileHost = {
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    readDirectory: ts.sys.readDirectory,
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    trace: (message) => logger.info(message),
    onUnRecoverableConfigFileDiagnostic: (diag) => logger.die(diag),
    getCurrentDirectory: ts.sys.getCurrentDirectory,
  };

  const cmdLine = ts.getParsedCommandLineOfConfigFile(
    path.join(process.env.PROGRAM_ROOT!, "tsconfig.json"),
    undefined,
    host,
  );
  if (!cmdLine) logger.die("Cannot read tsconfig.json file !");

  return ts.createProgram(sourceFiles, cmdLine.options);
}

//
// Parse a object ts.Type and return a protocol ObjectContentMap.
// path: path of the type for error messages
//
function parseObjectContent(type: ts.Type, typeChecker: ts.TypeChecker, path: string): protoGen.ObjectContentMap {
  const properties = type.getProperties();
  if (properties.length === 0) {
    protoGen.parseError(path, "Unexepect empty Object type.");
  }

  const objectContent: protoGen.ObjectContentMap = new Map();

  for (const property of properties) {
    const subPath = path + "." + property.name;
    if (!property.declarations || property.declarations.length === 0) {
      protoGen.parseError(subPath, "Invalid property declaration.");
    }

    let propertyType = typeChecker.getTypeAtLocation(property.declarations[0]);
    let propertyFlags = propertyType.getFlags();

    // Union are not supported but optional type are defined as union.
    // example: Name?: string => string | undefined (aka union)
    let optional = false;
    if (propertyFlags === ts.TypeFlags.Union) {
      // Handle optional enums: undefined get merged with enum symbols
      propertyType = unionTypeGetOriginalUnion(propertyType);

      // Look for the Undefined and return the other one
      const unionTypes = (propertyType as ts.UnionType).types;
      const unionTypesFlags = unionTypes.map((type) => type.flags);
      const undefinedIndex = unionTypesFlags.indexOf(ts.TypeFlags.Undefined);
      if (undefinedIndex < 0 || unionTypesFlags.length !== 2) {
        logger.die("Union not supported!");
      }
      propertyFlags = unionTypesFlags[1 - undefinedIndex];
      propertyType = unionTypes[1 - undefinedIndex];
      optional = true;
    }

    // Handle Objects
    if (propertyFlags === ts.TypeFlags.Object) {
      // Handle Arrays
      if (typeChecker.isArrayLikeType(propertyType)) {
        const arrayTsType = typeChecker.getTypeArguments(propertyType as ts.TypeReference)[0];
        const arrayProtocolType = parseSimpleType(arrayTsType.flags);
        if (arrayProtocolType === undefined) {
          protoGen.parseError(subPath, "Complex arrays are not supported!");
        }
        objectContent.set(property.name, { type: arrayProtocolType, optional, isArray: true });
        continue;
      }
      // Handle true object
      objectContent.set(
        property.name,
        {
          type: protoGen.Types.Object,
          optional,
          object: parseObjectContent(propertyType, typeChecker, subPath),
        },
      );
      continue;
    }

    // Handle enumerate
    if ((propertyFlags & ts.TypeFlags.EnumLike) &&
      (propertyFlags & ts.TypeFlags.Union)) {

      const enumSymbols: string[] = [];
      for (const enumElement of (propertyType as ts.UnionType).types) {
        enumSymbols.push(enumElement.symbol.getName());
      }

      objectContent.set(
        property.name,
        {
          type: protoGen.Types.Enum,
          optional,
          enumName: propertyType.aliasSymbol?.getName(),
          enumSymbols,
        },
      );
      continue;
    }

    // Handle simple types
    const simpleType = parseSimpleType(propertyFlags);
    if (simpleType === undefined) {
      protoGen.parseError(subPath, "Unsuported type!");
    }
    objectContent.set(
      property.name,
      {
        type: simpleType,
        optional,
      },
    );
  }

  return objectContent;
}

//
// Union of union get merged together.
// This function return the unmerged (original) one.
//
function unionTypeGetOriginalUnion(type: ts.Type): ts.Type {
  // Original union is curently not exposed by ts API.
  type typeWithOrigin = ts.Type & { origin: ts.Type };
  if ((type as typeWithOrigin).origin) {
    return (type as typeWithOrigin).origin;
  }
  return type;
}

//
// parse Flags for simple types. return protocol.Types or undefined
//
function parseSimpleType(flags: ts.TypeFlags): protoGen.Types | undefined {
  if (
    ((flags & ts.TypeFlags.NumberLike) !== 0) &&
    ((flags & ~ts.TypeFlags.Number) === 0)
  ) return protoGen.Types.Number;
  if (
    ((flags & ts.TypeFlags.BigIntLike) !== 0) &&
    ((flags & ~ts.TypeFlags.BigInt) === 0)
  ) return protoGen.Types.BigInt;
  if (
    ((flags & ts.TypeFlags.StringLike) !== 0) &&
    ((flags & ~ts.TypeFlags.String) === 0)
  ) return protoGen.Types.String;
  if (
    ((flags & ts.TypeFlags.BooleanLike) !== 0) &&
    ((flags & ~ts.TypeFlags.Boolean) === ts.TypeFlags.Union) // boolean is an union true | false
  ) return protoGen.Types.Boolean;

  return undefined;
}
