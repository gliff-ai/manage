import axios, { Method } from "axios";

type APIRoute = `${Method} /${string}`;

type ServiceFunction = (
  data?: Record<string, unknown>,
  token?: string
) => Promise<unknown>;

function isApiRoute(arg: APIRoute | ServiceFunction): arg is APIRoute {
  return typeof (arg as APIRoute) === "string";
}

interface Services {
  queryTeam: APIRoute | ServiceFunction;
  loginUser: APIRoute | ServiceFunction;
  inviteUser: APIRoute | ServiceFunction;
  inviteCollaborator: APIRoute | ServiceFunction;
  getProjects: APIRoute | ServiceFunction;
  updateProjectName: APIRoute | ServiceFunction;
  getProject: APIRoute | ServiceFunction;
  getCollectionMembers: APIRoute | ServiceFunction;
  createProject: APIRoute | ServiceFunction;
  inviteToProject: APIRoute | ServiceFunction;
  createPlugin: APIRoute | ServiceFunction;
  getPlugins: APIRoute | ServiceFunction;
  getCollectionsMembers: APIRoute | ServiceFunction;
  removeFromProject: APIRoute | ServiceFunction;
  deletePlugin: APIRoute | ServiceFunction;
  updatePlugin: APIRoute | ServiceFunction;
}

type ServiceFunctions = {
  [Property in keyof Services]: ServiceFunction;
};

function gen(apiPrefix: string, params: APIRoute): ServiceFunction {
  let url = `${apiPrefix}${params}`;
  let method = "GET" as Method;

  const paramsArray = params.split(" ");

  // This is until I can work out TS type inference for template strings!
  if (paramsArray[0] === "POST") method = "POST";

  url = `${apiPrefix}${paramsArray[1]}`;

  return async function req<T>(
    data: Record<string, unknown> = {},
    token?: string
  ) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: token ? `Token ${token}` : null,
    };

    const response = await axios.request<T>({
      method,
      url,
      headers,
      data,
    });

    return response.data;
  };
}

const initApiRequest = (
  API_URL: string,
  services: Services
): ServiceFunctions =>
  Object.keys(services).reduce(
    (acc: Partial<ServiceFunctions>, key: keyof Services) => {
      const service = services[key];

      acc[key] = isApiRoute(service) ? gen(API_URL, service) : service;

      return acc;
    },
    {}
  ) as ServiceFunctions;

export { initApiRequest };
export type { Services, ServiceFunctions };
