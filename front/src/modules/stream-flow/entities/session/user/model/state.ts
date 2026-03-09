import { currentUserCapabilitiesQuery, currentUserQuery } from './requests';

export const $user = currentUserQuery.$data;
export const $capabilities = currentUserCapabilitiesQuery.$data;
