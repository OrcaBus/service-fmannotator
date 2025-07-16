import { FMAnnotatorProps } from './fmannotator-stateless-stack';
import { VPC_LOOKUP_PROPS } from '@orcabus/platform-cdk-constructs/shared-config/networking';
import { EVENT_BUS_NAME } from '@orcabus/platform-cdk-constructs/shared-config/event-bridge';
import { FILE_MANAGER_DOMAIN_PREFIX } from '@orcabus/platform-cdk-constructs/shared-config/file-manager';
import { JWT_SECRET_NAME } from '@orcabus/platform-cdk-constructs/shared-config/secrets';
import { FMAnnotatorStatefulProps } from './fmannotator-stateful-stack';
import { FMANNOTATOR_QUEUE } from './constants';

export const getFmAnnotatorProps = (): FMAnnotatorProps => {
  return {
    vpcProps: VPC_LOOKUP_PROPS,
    fileManagerSecretName: JWT_SECRET_NAME,
    fileManagerDomainPrefix: FILE_MANAGER_DOMAIN_PREFIX,
    queueName: FMANNOTATOR_QUEUE,
  };
};

export const getFmAnnotatorStatefulProps = (): FMAnnotatorStatefulProps => {
  return {
    eventBusName: EVENT_BUS_NAME,
    queueName: FMANNOTATOR_QUEUE,
  };
};
