import { FMAnnotatorProps } from './fmannotator-stack';
import { EVENT_DLQ_NAME } from './constants';
import { VPC_LOOKUP_PROPS } from '@orcabus/platform-cdk-constructs/shared-config/networking';
import { EVENT_BUS_NAME } from '@orcabus/platform-cdk-constructs/shared-config/event-bridge';
import { FILE_MANAGER_DOMAIN_PREFIX } from '@orcabus/platform-cdk-constructs/shared-config/file-manager';
import { JWT_SECRET_NAME } from '@orcabus/platform-cdk-constructs/shared-config/secrets';

export const getFmAnnotatorProps = (): FMAnnotatorProps => {
  return {
    vpcProps: VPC_LOOKUP_PROPS,
    eventBusName: EVENT_BUS_NAME,
    fileManagerSecretName: JWT_SECRET_NAME,
    eventDLQName: EVENT_DLQ_NAME,
    fileManagerDomainPrefix: FILE_MANAGER_DOMAIN_PREFIX,
  };
};
