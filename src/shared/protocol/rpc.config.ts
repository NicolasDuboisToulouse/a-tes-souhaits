export type RpcType = {
  url: string;            // Url relative to /api
  requestName: string;    // Name of the request function
  request?: string;       // Name of the request type defined in Types (if any)
  response?: string;      // Name of the response type defined in Types (if any)
};

export const rpcs: RpcType[] = [
  {
    url: "/user/login",
    requestName: "requestLogin",
    request: "LoginInfo",
    response: "User",
  },

  {
    url: "/hello",
    requestName: "requestHello",
    request: "HelloReq",
    response: "HelloResp",
  },

  {
    url: "/empty",
    requestName: "requestEmpty",
  },

  {
    url: "/dont_exists",
    requestName: "requestDontExists",
  },

  {
    url: "/do_error",
    requestName: "requestDoError",
  },

  {
    url: "/timeout",
    requestName: "requestTimeout",
  },
];
