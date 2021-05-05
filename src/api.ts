import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

type Method = "GET" | "POST";
type APIRoute = `${Method} /${string}`;

function isApiRoute(arg: APIRoute | ServiceFunction): arg is APIRoute {
  return typeof (arg as APIRoute) === "string";
}

interface Services {
  queryTeam: APIRoute | ServiceFunction;
  loginUser: APIRoute | ServiceFunction;
}

type ServiceFunction<T> = (
  data?: Record<string, unknown>,
  token?: string
) => Promise<T>;

export type User = {
  email: string;
  accessToken: string;
};



// type ServiceFunctions = Record<keyof Services, ServiceFunction<unknown>>;
interface ServiceFunctions {
  [index: string]: ServiceFunction
}


function request<T>(
  url: string,
  method: Method,
  auth?: Record<string, string>, // This is a {header, value} pair
  body?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  return axios
    .request<T>({
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        ...auth,
      },
      data: body || {},
      ...config,
    })
    .then((response) => response.data);
}

function gen(
  apiPrefix: string,
  params: APIRoute | ServiceFunction
): ServiceFunction {
  if (!isApiRoute(params)) {
    return params;
  }

  let url = `${apiPrefix}${params}`;
  let method = "GET" as Method;

  const paramsArray = params.split(" ");

  // This is until I can work out TS type inference for template strings!
  if (paramsArray[0] === "POST") method = "POST";

  url = `${apiPrefix}${paramsArray[1]}`;

  return function req<T>(data: Record<string, unknown>, token?: string): Promise<T> {
     return request(
          url,
          method,
          token ? {Authorization: `Token ${token}`} : null,
          data
      );
  }
};

const initApiRequest = (
  API_URL: string,
  services: Services
): ServiceFunctions =>
  Object.keys(services).reduce(
    (acc: Partial<ServiceFunctions>, key: keyof Services) => {
      acc[key] = gen(API_URL, services[key]);
      return acc;
    },
    {}
  ) as ServiceFunctions;

export { Services, ServiceFunctions, initApiRequest };
