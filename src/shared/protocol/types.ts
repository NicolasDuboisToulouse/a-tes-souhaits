export interface HelloReq {
  message: string;
}

export interface HelloResp {
  message: string;
}

export enum EnumType {
  a,
  b,
  c,
}


export interface test {
  aString: string;
  aNumber?: number;
  big?: bigint;
  aBool: boolean;
  numArray: number[];
  anEnum?: EnumType;
  subObject: {
    subString: string;
    subObject2?: Generic;
  };
}

interface Generic {
  subString2: string;
}


export enum AnEnum { a, b }

export interface Complex {
  name: string;
  sub?: {
    a: number;
    b: string;
  };
  myEnum?: AnEnum;
  anArray?: string[];
  //  invalid: Foo;
}
