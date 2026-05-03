import { controlPlaneApi } from '@/modules/control-plane/shared/api';

export const fetchAppIsAdmin = async (): Promise<boolean> => {
  const [appAdminResponse, capabilitiesResponse] = await Promise.allSettled([
    controlPlaneApi.app.v1AppIsAdminList(),
    controlPlaneApi.acl.v2MeCapabilitiesList(),
  ]);

  const isAdminByApp =
    appAdminResponse.status === 'fulfilled' &&
    Boolean(appAdminResponse.value.data.is_admin);

  const isRootByCapabilities =
    capabilitiesResponse.status === 'fulfilled' &&
    Boolean(capabilitiesResponse.value.data.capabilities?.is_root);

  return isAdminByApp || isRootByCapabilities;
};
