import { getResponseError } from './get-response-error';

export const getResponseErrorMessage = (response: unknown) => {
  return getResponseError(response)?.external_message || '';
};
