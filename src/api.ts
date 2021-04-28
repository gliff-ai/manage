import axios, { AxiosRequestConfig } from "axios";

type Method = "GET" | "POST";
type APIRoute = `${Method} /${string}`;

type ServiceFunction = (
  arg0?: any
) => Promise<void | {
  success: boolean;
  message: string;
  statusCode: number;
  data: any;
}>;

interface Services {
  queryUsers: APIRoute | ServiceFunction;
  loginUser: APIRoute | ServiceFunction;
}

type ServiceFunctions = Record<keyof Services, ServiceFunction>;

const gen = (apiPrefix: string, params: APIRoute | ServiceFunction) => {
  if (typeof params === "string") {
    let url = `${apiPrefix}${params}`;
    let method = "GET";

    const paramsArray = params.split(" ");
    if (paramsArray.length === 2) {
      [method] = paramsArray;
      url = `${apiPrefix}${paramsArray[1]}`;
    }

    return (data) =>
      request({
        url,
        data,
        method,
      });
  } else {
    return params;
  }
};

const initApiRequest = (API_URL: string, services: Services) => {
  const APIFunction = Object.keys(services).reduce(
    (acc: Partial<ServiceFunctions>, key: keyof Services) => {
      acc[key] = gen(API_URL, services[key]);
      return acc;
    },
    {}
  ) as ServiceFunctions;

  return APIFunction;

  // return function apiRequest<T>(
  //   path: string,
  //   method: Method,
  //   body?: Record<string, unknown>,
  //   config?: AxiosRequestConfig
  // ): Promise<T> {
  //   return axios.request({
  //     method,
  //     url: `${API_URL}${path}`,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     data: body || {},
  //     withCredentials: true,
  //     ...config,
  //   });
  // };
};

function request(options) {
  return axios(options)
    .then((response) => {
      const { statusText, status, data } = response;

      return Promise.resolve({
        success: true,
        message: statusText,
        statusCode: status,
        data,
      });
    })
    .catch((error) => {
      console.log(error);
      /* eslint-disable */
      // return Promise.reject({
      //   success: false,
      //   statusCode,
      //   message: msg,
      // })
    });
}

export { Services, ServiceFunctions, initApiRequest };
