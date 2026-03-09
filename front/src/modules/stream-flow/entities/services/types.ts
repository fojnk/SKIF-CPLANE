import * as React from 'react';
import { SVGProps } from 'react';

import { AppModule } from '@/shared/lib/complex/modules';

export interface ServiceInfo {
  name: string;
  withRedirect?: boolean;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  module?: AppModule<any>;
  available?: boolean;
  description?: string;
  tags?: string[];
  searchText?: string;
  externalHref?: string;
  displayName?: string;
}
