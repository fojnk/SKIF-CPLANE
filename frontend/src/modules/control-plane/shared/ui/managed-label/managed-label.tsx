import { Label } from '@gravity-ui/uikit';

interface Props {
  size?: 'xs' | 's' | 'm';
}

export const ManagedLabel = ({ size = 's' }: Props) => {
  return (
    <Label size={size} theme="warning">
      managed
    </Label>
  );
};
