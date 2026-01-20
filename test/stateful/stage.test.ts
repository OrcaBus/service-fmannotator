import { App } from 'aws-cdk-lib';
import { getFmAnnotatorStatefulProps } from '../../infrastructure/stage/config';
import { FMAnnotatorStatefulStack } from '../../infrastructure/stage/fmannotator-stateful-stack';
import { cdkNagStack } from '../util';

describe('cdk-nag-stateless-toolchain-stack', () => {
  const app = new App();

  const fmAnnotatorStack = new FMAnnotatorStatefulStack(app, 'FMAnnotatorStatefulStack', {
    ...getFmAnnotatorStatefulProps(),
    env: {
      account: '123456789',
      region: 'ap-southeast-2',
    },
  });

  cdkNagStack(fmAnnotatorStack, () => {
    return;
  });
});
