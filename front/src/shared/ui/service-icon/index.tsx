import cx from 'clsx';
import { SVGAttributes } from 'react';

import {
  Abc,
  Artifactory,
  DataTransfer,
  Discovery,
  Docs,
  Inference,
  Mdb,
  Mops,
  OneFlow,
  OneSecret,
  Pms,
  S3,
  SsEtl,
  ControlPlane,
  UcpModels,
  Warp,
} from './assets';

type LogoProps = SVGAttributes<SVGSVGElement>;

const AbcLogo = ({ className, ...props }: LogoProps) => {
  return <Abc {...props} className={cx(className)} />;
};

const ArtifactoryLogo = ({ className, ...props }: LogoProps) => {
  return <Artifactory {...props} className={cx(className)} />;
};

const DataTransferLogo = ({ className, ...props }: LogoProps) => {
  return <DataTransfer {...props} className={cx(className)} />;
};

const DiscoveryLogo = ({ className, ...props }: LogoProps) => {
  return <Discovery {...props} className={cx(className)} />;
};

const DocsLogo = ({ className, ...props }: LogoProps) => {
  return <Docs {...props} className={cx(className)} />;
};

const InferenceLogo = ({ className, ...props }: LogoProps) => {
  return <Inference {...props} className={cx(className)} />;
};

const MdbLogo = ({ className, ...props }: LogoProps) => {
  return <Mdb {...props} className={cx(className)} />;
};

const MopsLogo = ({ className, ...props }: LogoProps) => {
  return <Mops {...props} className={cx(className)} />;
};

const OneFlowLogo = ({ className, ...props }: LogoProps) => {
  return <OneFlow {...props} className={cx(className)} />;
};

const OneSecretLogo = ({ className, ...props }: LogoProps) => {
  return <OneSecret {...props} className={cx(className)} />;
};

const PmsLogo = ({ className, ...props }: LogoProps) => {
  return <Pms {...props} className={cx(className)} />;
};

const S3Logo = ({ className, ...props }: LogoProps) => {
  return <S3 {...props} className={cx(className)} />;
};

const SsEtlLogo = ({ className, ...props }: LogoProps) => {
  return <SsEtl {...props} className={cx(className)} />;
};

export const ControlPlaneLogo = ({ className, ...props }: LogoProps) => {
  return <ControlPlane {...props} className={cx(className)} />;
};

const UcpModelsLogo = ({ className, ...props }: LogoProps) => {
  return <UcpModels {...props} className={cx(className)} />;
};

const WarpLogo = ({ className, ...props }: LogoProps) => {
  return <Warp {...props} className={cx(className)} />;
};

export const ServiceIcon = {
  AbcLogo,
  ArtifactoryLogo,
  DataTransferLogo,
  DiscoveryLogo,
  DocsLogo,
  InferenceLogo,
  MdbLogo,
  MopsLogo,
  OneFlowLogo,
  OneSecretLogo,
  PmsLogo,
  S3Logo,
  SsEtlLogo,
  ControlPlaneLogo,
  UcpModelsLogo,
  WarpLogo,
};
