import { projectLinksModel } from '@/modules/control-plane/entities/projects/links';

export const { load, $loading, $failed, reset, $data } =
  projectLinksModel.create();
