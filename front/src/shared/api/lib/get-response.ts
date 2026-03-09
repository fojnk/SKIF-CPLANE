import { isHttpResponse } from './is-http-response';

export const getResponse = (response: unknown) =>
  isHttpResponse(response) ? response : null;
