import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

type Method = "GET" | "POST";
type APIRoute = `${Method} /${string}`;

function isApiRoute(arg: APIRoute | ServiceFunction<unknown>): arg is APIRoute {
  return typeof (arg as APIRoute) === "string";
}

type ServiceFunction<T> = (
  data?: Record<string, unknown>
) => Promise<T | AxiosResponse<T>>;

export type User = {
  email: string;
  accessToken: string;
};

interface Services {
  queryTeam: APIRoute | ServiceFunction<unknown>;
  loginUser: APIRoute | ServiceFunction<User>;
}

type ServiceFunctions = Record<keyof Services, ServiceFunction<unknown>>;

function request(
  url: string,
  method: Method,
  auth?: Record<string, string>, // This is a {header, value} pair
  body?: Record<string, unknown>,
  config?: AxiosRequestConfig
) {
  return axios.request({
    method,
    url,
    headers: {
      "Content-Type": "application/json",
      ...auth,
    },
    data: body || {},
    ...config,
  });
}

const gen = (
  apiPrefix: string,
  params: APIRoute | ServiceFunction<unknown>,
  token?: string
) => {
  if (!isApiRoute(params)) {
    return params;
  }

  let url = `${apiPrefix}${params}`;
  let method = "GET" as Method;

  const paramsArray = params.split(" ");

  // This is until I can work out TS type inference for template strings!
  if (paramsArray[0] === "POST") method = "POST";

  url = `${apiPrefix}${paramsArray[1]}`;

  return (data: Record<string, unknown>) =>
    request(url, method, { Authorization: `Token ${token}` }, data);
};

const initApiRequest = (API_URL: string, services: Services, token?: string): ServiceFunctions =>
  Object.keys(services).reduce(
    (acc: Partial<ServiceFunctions>, key: keyof Services) => {
      acc[key] = gen(API_URL, services[key], token);
      return acc;
    },
    {}
  ) as ServiceFunctions;

export { Services, ServiceFunctions, initApiRequest };
