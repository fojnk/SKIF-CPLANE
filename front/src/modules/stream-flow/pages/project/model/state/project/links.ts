import { projectLinksModel } from '@/modules/stream-flow/entities/projects/links';

export const { load, $loading, $failed, reset, $data } =
  projectLinksModel.create();
