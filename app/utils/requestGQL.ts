import type { RootResult } from "app/types/app_create-goal";
import type { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";


export const requestQuery = async <T>(admin: AdminApiContextWithoutRest, query: string): Promise<T> => {
  const response = await admin.graphql(query);
  const data = (await response.json()) as RootResult<T>;
  return data?.data;
};

export const requestMutation = async <T>(
  admin: AdminApiContextWithoutRest,
  query: string,
  variables: Record<string, any>,
): Promise<T> => {
  const response = await admin.graphql(query, variables);
  const data = (await response.json()) as RootResult<T>;
  return data?.data;
};
