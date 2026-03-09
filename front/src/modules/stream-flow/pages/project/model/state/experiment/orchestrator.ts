import { experimentsModel } from '@/modules/stream-flow/entities/experiments';

export const { load, $loading, $failed, reset, $data } =
  experimentsModel.orchestrator.create();
