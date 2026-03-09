export const getNovaLink = 'https://one.vk.team/nova/products';

export const getNovaAlertsLink = (productId: string) => {
  return `${getNovaLink}/details/${productId}?tab=alerts`;
};
