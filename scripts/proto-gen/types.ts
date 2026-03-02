export enum Types {
  BigInt,
  Number,
  String,
  Boolean,
  Enum,
  Object,
}

export type ContentType = {
  type: Types;
  optional: boolean;
  enumName?: string;
  enumSymbols?: string[];
  object?: ObjectContentMap;
  isArray?: boolean;
};

export type ObjectContentMap = Map<string, ContentType>;

export type Object = { name: string; content: ObjectContentMap };
