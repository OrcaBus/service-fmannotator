import { App, Aspects } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks } from 'cdk-nag';
import { FMAnnotatorStack } from '../infrastructure/stage/fmannotator-stack';
import { getFmAnnotatorProps } from '../infrastructure/stage/config';
import { synthesisMessageToString } from '@orcabus/platform-cdk-constructs/utils';

describe('cdk-nag-stateless-toolchain-stack', () => {
  const app = new App();

  const fmAnnotatorStack = new FMAnnotatorStack(app, 'FMAnnotatorStatelessStack', {
    ...getFmAnnotatorProps(),
    env: {
      account: '123456789',
      region: 'ap-southeast-2',
    },
  });

  Aspects.of(fmAnnotatorStack).add(new AwsSolutionsChecks());

  test(`cdk-nag AwsSolutions Pack errors`, () => {
    const errors = Annotations.fromStack(fmAnnotatorStack)
      .findError('*', Match.stringLikeRegexp('AwsSolutions-.*'))
      .map(synthesisMessageToString);
    expect(errors).toHaveLength(0);
  });

  test(`cdk-nag AwsSolutions Pack warnings`, () => {
    const warnings = Annotations.fromStack(fmAnnotatorStack)
      .findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'))
      .map(synthesisMessageToString);
    expect(warnings).toHaveLength(0);
  });
});
