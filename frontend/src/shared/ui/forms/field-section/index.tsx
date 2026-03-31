import {
  ConfigFieldSection,
  ConfigFieldSectionProps,
} from './config-field-section';
import { FieldSectionError } from './field-section-error';
import { FieldSectionHeader } from './field-section-header';
import { FieldSectionWrapper } from './field-section-wrapper';
import {
  SimpleFieldSection,
  SimpleFieldSectionProps,
} from './simple-field-section';

import './index.scss';

export interface FieldSectionProps
  extends Omit<SimpleFieldSectionProps, 'outerContent'> {
  config?: ConfigFieldSectionProps['config'];
  elementOnly?: ConfigFieldSectionProps['elementOnly'];
}

const FieldSectionBase = (props: FieldSectionProps) => {
  if (props.config) {
    // @ts-expect-error особенности TS
    return <ConfigFieldSection {...props} />;
  }
  return <SimpleFieldSection {...props} />;
};

export const FieldSection = FieldSectionBase as typeof FieldSectionBase & {
  Wrapper: typeof FieldSectionWrapper;
  Header: typeof FieldSectionHeader;
  Error: typeof FieldSectionError;
};

FieldSection.Wrapper = FieldSectionWrapper;
FieldSection.Header = FieldSectionHeader;
FieldSection.Error = FieldSectionError;
