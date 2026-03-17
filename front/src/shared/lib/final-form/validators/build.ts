import * as validators from './index';

export interface BuildRules {
  required?: boolean;
  username?: boolean;
  url?: boolean;
  email?: boolean;
  minLength?: number;
  min?: number;
  max?: number;
  integer?: boolean;
  numeric?: boolean;
  cron?: boolean;
  maxStrLength?: number;
  noSpaces?: boolean;
  keyName?: boolean;
  oneDot?: boolean;
  porto?: boolean;
  json?: boolean;
  uniq?: string[];
  noNumbers?: boolean;
  noOnlyNumbers?: boolean;
  snakeCase?: boolean;
}

export const build = (buildRules: Maybe<BuildRules>) =>
  validators.compose(
    buildRules?.required && validators.required,
    buildRules?.username && validators.username,
    buildRules?.url && validators.url,
    buildRules?.numeric && validators.numeric,
    buildRules?.integer && validators.integer,
    buildRules?.min != null &&
      ((value: any) => validators.min(value, buildRules!.min!)),
    buildRules?.max != null &&
      ((value: any) => validators.max(value, buildRules!.max!)),
    buildRules?.minLength != null &&
      ((value: any) => validators.minLength(value, buildRules!.minLength!)),
    buildRules?.cron && validators.isValidCron,
    buildRules?.maxStrLength != null &&
      ((value: any) =>
        validators.maxStrLength(value, buildRules!.maxStrLength!)),
    buildRules?.noSpaces && validators.noSpaces,
    buildRules?.oneDot && validators.oneDot,
    buildRules?.keyName && validators.keyName,
    buildRules?.porto && validators.porto,
    buildRules?.json && validators.json,
    buildRules?.uniq &&
      ((value: any) => validators.uniq(value, buildRules!.uniq!)),
    buildRules?.noNumbers && validators.noNumbers,
    buildRules?.noOnlyNumbers && validators.noOnlyNumbers,
    buildRules?.snakeCase && validators.snakeCase,
  );
