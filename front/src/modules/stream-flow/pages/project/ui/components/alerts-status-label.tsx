import { Label } from '@gravity-ui/uikit';

import { severityStatusNames } from '@/modules/stream-flow/pages/project';

type AlertStatusLabelType = {
  status: string;
  size?: 'xs' | 's' | 'm';
};

export const AlertStatusLabel = ({
  status,
  size = 'xs',
}: AlertStatusLabelType) => {
  let theme: 'info' | 'warning' | 'danger' | 'unknown';
  switch (status) {
    case severityStatusNames.warning:
    case severityStatusNames.warningCaps:
      theme = 'warning';
      break;
    case severityStatusNames.info:
    case severityStatusNames.infoCaps:
      theme = 'info';
      break;
    case severityStatusNames.critical:
    case severityStatusNames.criticalCaps:
    case severityStatusNames.disaster:
    case severityStatusNames.disasterCaps:
      theme = 'danger';
      break;
    default:
      theme = 'unknown';
  }
  return (
    <Label theme={theme} size={size}>
      {status}
    </Label>
  );
};
