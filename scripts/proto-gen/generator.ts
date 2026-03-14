import path from "path";
import ts from "typescript";
import * as fs from "@scripts/tools/fs";
import * as logger from "@shared/logger";
import { parseTypes } from "./parser-types";
import { generatePredicateFileNodes } from "./generator-predicates";
import { generateClientNodes } from "./generator-client";
import { generateServerNodes } from "./generator-server";

export function updateProtocol() {

  if (!process.env.PROGRAM_ROOT) logger.die("Environment is not set!");

  const generatorPath = path.join(process.env.PROGRAM_ROOT, "scripts", "proto-gen");
  const protocolPath = path.join(process.env.PROGRAM_ROOT, "src", "shared", "protocol");
  const protocolTypeFile = path.join(protocolPath, "types.ts");
  const protocolRpcFile = path.join(protocolPath, "rpc.config.ts");
  const protocolGenDir = path.join(protocolPath, "generated");
  const protocolPredicateFile = path.join(protocolGenDir, "predicates.ts");
  const protocolClientFile = path.join(protocolGenDir, "client.ts");
  const protocolServerFile = path.join(protocolGenDir, "server.ts");

  const filesToCheck = [
    ...fs.readdirSync(generatorPath).map((f) => path.join(generatorPath, f)),
    protocolTypeFile,
    protocolRpcFile,
  ];

  if (!filesToCheck.every((f) => !fs.isFirstNewer(f, protocolPredicateFile))) {
    fs.mkdirSync(protocolGenDir, { recursive: true });

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const sourceFile = ts.createSourceFile("t.ts", "", ts.ScriptTarget.Latest);

    const types = parseTypes(protocolTypeFile);
    const predicateNodes = generatePredicateFileNodes(types);
    const predicateCode = printer.printList(ts.ListFormat.MultiLine, predicateNodes, sourceFile);
    fs.writeFileSync(protocolPredicateFile, predicateCode);

    const clientNodes = generateClientNodes();
    const clientCode = printer.printList(ts.ListFormat.MultiLine, clientNodes, sourceFile);
    fs.writeFileSync(protocolClientFile, clientCode);

    const serverNodes = generateServerNodes();
    const serverCode = printer.printList(ts.ListFormat.MultiLine, serverNodes, sourceFile);
    fs.writeFileSync(protocolServerFile, serverCode);


    logger.info("Protocol has been updated.");
  } else {
    logger.info("Protocol is up to date.");
  }
}
