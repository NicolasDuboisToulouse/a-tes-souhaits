export type ErrorMessage = {
  errorMessage: string;
};

export type User = {
  userName: string;
  displayName: string;
  isAdmin: boolean;
  firstLogin: boolean;
};

export type LoginInfo = {
  userName: string;
  password: string;
};


export type HelloReq = {
  message: string;
};

export type HelloResp = {
  message: string;
};
