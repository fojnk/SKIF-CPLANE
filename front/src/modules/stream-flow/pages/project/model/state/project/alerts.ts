import { AlertsCreate } from '@/modules/stream-flow/entities/alerts/create';
import { AlertsRemove } from '@/modules/stream-flow/entities/alerts/delete';
import { AlertsEdit } from '@/modules/stream-flow/entities/alerts/edit';
import { AlertListModelV2 } from '@/modules/stream-flow/entities/alerts/list_v2';
import { AlertsProducts } from '@/modules/stream-flow/entities/alerts/products';
import { AlertsOptionsList } from '@/modules/stream-flow/entities/alerts/templatesList_v2';

const {
  load: alertsListLoadV2,
  $loading: alertsListLoadingV2,
  $failed: alertsListFailedV2,
  $data: alertsListV2,
  reset: alertsListResetV2,
} = AlertListModelV2.create();

const {
  load: alertsOptionsListLoadV2,
  $loading: alertsOptionsListLoadingV2,
  $failed: alertsOptionsListFailedV2,
  $data: alertsOptionsListV2,
  reset: alertsOptionsListResetV2,
} = AlertsOptionsList.create();

const {
  load: alertsCreateLoadV2,
  success: alertsCreateSuccessV2,
  $loading: alertsCreateLoadingV2,
  $failed: alertsCreateFailedV2,
  $data: alertsCreateDataV2,
  reset: alertsCreateResetV2,
  $lastCreatedProductId: alertsCreateLastCreatedProductIdV2,
} = AlertsCreate.create();

const {
  remove: alertsRemoveLoadV2,
  success: alertRemoveSuccessV2,
  $loading: alertsRemoveLoadingV2,
  $failed: alertsRemoveFailedV2,
  $data: alertsRemoveDataV2,
  reset: alertsRemoveResetV2,
} = AlertsRemove.create();

const {
  edit: alertsEdit,
  success: alertEditSuccess,
  $loading: alertsEditLoading,
  $failed: alertsEditFailed,
  $data: alertsEditData,
  reset: alertsEditReset,
} = AlertsEdit.create();

const {
  load: alertsProductsLoad,
  success: alertsProductsSuccess,
  $loading: alertsProductsLoading,
  $failed: alertsProductsFailed,
  $data: alertsProductsData,
  reset: alertsProductsReset,
} = AlertsProducts.create();

export {
  alertsListLoadV2,
  alertsListLoadingV2,
  alertsListFailedV2,
  alertsListV2,
  alertsListResetV2,
  alertsOptionsListLoadV2,
  alertsOptionsListLoadingV2,
  alertsOptionsListFailedV2,
  alertsOptionsListV2,
  alertsOptionsListResetV2,
  alertsCreateLoadV2,
  alertsCreateLoadingV2,
  alertsCreateFailedV2,
  alertsCreateDataV2,
  alertsCreateResetV2,
  alertsCreateLastCreatedProductIdV2,
  alertsCreateSuccessV2,
  alertsRemoveLoadV2,
  alertRemoveSuccessV2,
  alertsRemoveLoadingV2,
  alertsRemoveFailedV2,
  alertsRemoveDataV2,
  alertsRemoveResetV2,
  alertsEdit,
  alertEditSuccess,
  alertsEditLoading,
  alertsEditFailed,
  alertsEditData,
  alertsEditReset,
  alertsProductsLoad,
  alertsProductsSuccess,
  alertsProductsLoading,
  alertsProductsFailed,
  alertsProductsData,
  alertsProductsReset,
};
