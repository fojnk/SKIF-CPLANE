import { isErrorDC } from './is-error-dc';
import { isHttpResponse } from './is-http-response';

export const getResponseError = (response: unknown) => {
  return isHttpResponse(response) && isErrorDC(response.error)
    ? response.error
    : null;
};
