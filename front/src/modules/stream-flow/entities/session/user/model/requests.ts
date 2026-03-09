import { createQuery } from '@farfetched/core';

import { streamFlowApi } from '@/modules/stream-flow/shared/api/__generated__';

export const currentUserQuery = createQuery({
  handler: async () => {
    const response = await streamFlowApi.oauth.whoAmIList();
    return response.data;
  },
});

export const currentUserCapabilitiesQuery = createQuery({
  handler: async () => {
    const response = await streamFlowApi.acl.v2MeCapabilitiesList();
    return response.data.capabilities;
  },
});
