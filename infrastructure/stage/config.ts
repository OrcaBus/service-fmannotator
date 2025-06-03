import { FMAnnotatorProps } from './fmannotator-stack';
import { eventBusName, eventDlqNameFMAnnotator, jwtSecretName, vpcProps } from './constants';

export const getFmAnnotatorProps = (): FMAnnotatorProps => {
  return {
    vpcProps,
    eventBusName,
    fileManagerSecretName: jwtSecretName,
    eventDLQName: eventDlqNameFMAnnotator,
    fileManagerDomainPrefix: 'file',
  };
};
