export type RpcType = {
  url: string;              // Url relative to /api
  name: string;             // Name of the request function
  input?: string;           // Name of the input type defined in Types (if any)
  output?: string;          // Name of the output type defined in Types (if any)
  AllowUndefined?: boolean; // output can be undefined
};

export const rpcs: RpcType[] = [
  {
    url: "/user/login",
    name: "requestLogin",
    input: "LoginInfo",
    output: "User",
  },

  {
    url: "/user/tokenLogin",
    name: "requestTokenLogin",
    output: "User",
    AllowUndefined: true,
  },

  {
    url: "/hello",
    name: "requestHello",
    input: "HelloReq",
    output: "HelloResp",
  },

  {
    url: "/empty",
    name: "requestEmpty",
  },

  {
    url: "/dont_exists",
    name: "requestDontExists",
  },

  {
    url: "/do_error",
    name: "requestDoError",
  },

  {
    url: "/timeout",
    name: "requestTimeout",
  },
];
