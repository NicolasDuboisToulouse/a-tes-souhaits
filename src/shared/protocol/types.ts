export type HelloReq = {
  message: string;
};

export type HelloResp = {
  message: string;
};

export enum EnumType {
  a,
  b,
  c,
}


export type test = {
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
};

type Generic = {
  subString2: string;
};


export enum AnEnum { a, b }

export type Complex = {
  name: string;
  sub?: {
    a: number;
    b: string;
  };
  myEnum?: AnEnum;
  anArray?: string[];
  //  invalid: Foo;
};
