import { createQuery } from '@farfetched/core';

import { controlPlaneApi } from '@/modules/control-plane/shared/api/__generated__';

export const currentUserQuery = createQuery({
  handler: async () => {
    const response = await controlPlaneApi.oauth.whoAmIList();
    return response.data;
  },
});

export const currentUserCapabilitiesQuery = createQuery({
  handler: async () => {
    const response = await controlPlaneApi.acl.v2MeCapabilitiesList();
    return response.data.capabilities;
  },
});
