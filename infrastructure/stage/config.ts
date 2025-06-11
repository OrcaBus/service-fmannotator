import { FMAnnotatorProps } from './fmannotator-stack';
import { EVENT_DLQ_NAME } from './constants';
import { VPC_LOOKUP_PROPS } from '@orcabus/platform-cdk-constructs/shared-config/networking';
import { DEFAULT_ORCABUS_TOKEN_SECRET_ID } from '@orcabus/platform-cdk-constructs/lambda/config';
import { EVENT_BUS_NAME } from '@orcabus/platform-cdk-constructs/shared-config/event-bridge';
import { fileManagerDomainPrefix } from '@orcabus/platform-cdk-constructs/shared-config/file-manager';

export const getFmAnnotatorProps = (): FMAnnotatorProps => {
  return {
    vpcProps: VPC_LOOKUP_PROPS,
    eventBusName: EVENT_BUS_NAME,
    fileManagerSecretName: DEFAULT_ORCABUS_TOKEN_SECRET_ID,
    eventDLQName: EVENT_DLQ_NAME,
    fileManagerDomainPrefix: fileManagerDomainPrefix,
  };
};
