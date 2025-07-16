import { Construct } from 'constructs';
import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { MonitoredQueue } from '@orcabus/platform-cdk-constructs/monitored-queue';
import { SlackAlerts } from '@orcabus/platform-cdk-constructs/shared-config/slack';

/**
 * Config for the FM annotator stateful stack.
 */
export interface FMAnnotatorConfig {
  /**
   * The name of the OrcaBus event bus.
   */
  eventBusName: string;
  /**
   * The name of the queue to redirect events to.
   */
  queueName: string;
}

/**
 * Props for the fm annotator stateful stack.
 */
export type FMAnnotatorStatefulProps = StackProps & FMAnnotatorConfig;

/**
 * Construct used to configure stateful resources for the fm annotator.
 */
export class FMAnnotatorStatefulStack extends Stack {
  readonly monitoredQueue: MonitoredQueue;

  constructor(scope: Construct, id: string, props: StackProps & FMAnnotatorStatefulProps) {
    super(scope, id, props);

    const alarmOldestMessage = Duration.days(2).toSeconds();
    this.monitoredQueue = new MonitoredQueue(this, 'MonitoredQueue', {
      queueProps: {
        queueName: props.queueName,
        removalPolicy: RemovalPolicy.RETAIN,
        alarmOldestMessageSeconds: alarmOldestMessage,
      },
      dlqProps: {
        queueName: `${props.queueName}-dlq`,
        removalPolicy: RemovalPolicy.RETAIN,
        retentionPeriod: Duration.days(14),
        alarmOldestMessageSeconds: alarmOldestMessage,
      },
      snsTopicArn: SlackAlerts.formatArn(this),
    });
    this.monitoredQueue.queue.grantSendMessages(new ServicePrincipal('events.amazonaws.com'));

    const eventBus = EventBus.fromEventBusName(this, 'OrcaBusMain', props.eventBusName);
    const eventRule = new Rule(this, 'EventRule', {
      description: 'Send WorkflowRunStateChange events to the annotator Lambda',
      eventBus,
    });

    eventRule.addTarget(new SqsQueue(this.monitoredQueue.queue));
    eventRule.addEventPattern({
      // Allow accepting a self-made event used for testing.
      source: ['orcabus.workflowmanager', 'orcabus.fmannotator'],
      detailType: ['WorkflowRunStateChange'],
      detail: {
        status: [
          { 'equals-ignore-case': 'SUCCEEDED' },
          { 'equals-ignore-case': 'FAILED' },
          { 'equals-ignore-case': 'ABORTED' },
        ],
      },
    });
  }
}
