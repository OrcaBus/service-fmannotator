import { App, Stack } from 'aws-cdk-lib';
import { NagSuppressions } from 'cdk-nag';
import { FMAnnotatorStack } from '../../infrastructure/stage/fmannotator-stateless-stack';
import { getFmAnnotatorProps } from '../../infrastructure/stage/config';
import { cdkNagStack } from '../util';

/**
 * Apply nag suppression for the stateless stack
 * @param stack
 */
function applyStatelessNagSuppressions(stack: Stack) {
  NagSuppressions.addStackSuppressions(
    stack,
    [{ id: 'AwsSolutions-IAM4', reason: 'allow AWS managed policy' }],
    true
  );
}

describe('cdk-nag-stateless-stage-stack', () => {
  const app = new App();

  const fmAnnotatorStack = new FMAnnotatorStack(app, 'FMAnnotatorStatelessStack', {
    ...getFmAnnotatorProps(),
    env: {
      account: '123456789',
      region: 'ap-southeast-2',
    },
  });

  cdkNagStack(fmAnnotatorStack, applyStatelessNagSuppressions);
});
