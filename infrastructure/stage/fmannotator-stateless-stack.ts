import { Arn, Duration, Stack, StackProps } from 'aws-cdk-lib';
import {
  ISecurityGroup,
  IVpc,
  SecurityGroup,
  SubnetType,
  Vpc,
  VpcLookupOptions,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha';
import path from 'path';
import { Architecture } from 'aws-cdk-lib/aws-lambda';
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { NamedLambdaRole } from '@orcabus/platform-cdk-constructs/named-lambda-role';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

/**
 * Config for the FM annotator.
 */
export interface FMAnnotatorConfig {
  /**
   * VPC props.
   */
  vpcProps: VpcLookupOptions;
  /**
   * The name of the queue to receive events from.
   */
  queueName: string;
  /**
   * The filemanager JWT secret name.
   */
  fileManagerSecretName: string;
  /**
   * The filemanager domain name prefix.
   */
  fileManagerDomainPrefix: string;
}

/**
 * Props for the FM annotator stack which can be configured
 */
export type FMAnnotatorProps = StackProps & FMAnnotatorConfig;

/**
 * Construct used to configure the FM annotator.
 */
export class FMAnnotatorStack extends Stack {
  private readonly vpc: IVpc;
  private readonly securityGroup: ISecurityGroup;
  private readonly queue: IQueue;

  constructor(scope: Construct, id: string, props: FMAnnotatorProps) {
    super(scope, id, props);

    this.vpc = Vpc.fromLookup(this, 'MainVpc', props.vpcProps);

    this.securityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
      description: 'Security group that allows the annotator Lambda to egress out.',
    });

    this.queue = Queue.fromQueueArn(
      this,
      'FMAnnotatorQueue',
      Arn.format(
        {
          resource: props.queueName,
          service: 'sqs',
        },
        this
      )
    );

    const tokenSecret = Secret.fromSecretNameV2(this, 'JwtSecret', props.fileManagerSecretName);
    const domain = StringParameter.valueForStringParameter(this, '/hosted_zone/umccr/name');
    const env = {
      FMANNOTATOR_FILE_MANAGER_ENDPOINT: `https://${props.fileManagerDomainPrefix}.${domain}`,
      FMANNOTATOR_FILE_MANAGER_SECRET_NAME: tokenSecret.secretName,
      FMANNOTATOR_QUEUE_NAME: props.queueName,
      GO_LOG: 'debug',
    };

    const appDir = path.join(__dirname, '..', '..', 'app');
    const fn = new GoFunction(this, 'PortalRunId', {
      entry: path.join(appDir, 'cmd', 'portalrunid'),
      environment: env,
      memorySize: 128,
      timeout: Duration.seconds(28),
      architecture: Architecture.ARM_64,
      role: this.createRole(tokenSecret, 'Role'),
      vpc: this.vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [this.securityGroup],
    });
    fn.addEventSource(new SqsEventSource(this.queue));

    new GoFunction(this, 'PortalRunIdQueue', {
      entry: path.join(appDir, 'cmd', 'portalrunidqueue'),
      environment: env,
      memorySize: 128,
      timeout: Duration.seconds(28),
      architecture: Architecture.ARM_64,
      role: this.createRole(tokenSecret, 'QueueRole'),
      vpc: this.vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [this.securityGroup],
    });
  }

  private createRole(tokenSecret: ISecret, id: string) {
    const role = new NamedLambdaRole(this, id);
    role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
    );
    // Need access to secrets to fetch FM JWT token.
    tokenSecret.grantRead(role);

    role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaSQSQueueExecutionRole')
    );

    return role;
  }
}
