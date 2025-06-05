
import { StreamFailureEntity } from "@/types/streamFailure";

const orgIds = ['org-001', 'org-002', 'org-003', 'org-004', 'org-005'];
const statuses = ['PENDING', 'PROCESSING', 'FAILED', 'RESOLVED', 'ESCALATED'];

const payloadTemplates = [
  {
    errorCode: 'CONN_TIMEOUT',
    message: 'Connection timeout while establishing stream',
    deviceId: 'device-{random}',
    attempts: 3,
    lastError: 'Socket timeout after 30 seconds'
  },
  {
    errorCode: 'AUTH_FAILED',
    message: 'Authentication failed for stream connection',
    userId: 'user-{random}',
    authMethod: 'oauth2',
    reason: 'Invalid token'
  },
  {
    errorCode: 'RATE_LIMIT',
    message: 'Rate limit exceeded for organization',
    requestsPerMinute: 1500,
    limit: 1000,
    resetTime: new Date().toISOString()
  }
];

export const generateMockFailures = (count: number, offset: number = 0): StreamFailureEntity[] => {
  return Array.from({ length: count }, (_, i) => {
    const index = offset + i;
    const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const shouldHaveEndDate = Math.random() > 0.3;
    const endDate = shouldHaveEndDate 
      ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      : null;

    const payloadTemplate = payloadTemplates[Math.floor(Math.random() * payloadTemplates.length)];
    const payload = {
      ...payloadTemplate,
      timestamp: createdDate.toISOString(),
      correlationId: `corr-${Date.now()}-${index}`,
      metadata: {
        version: '1.0',
        source: 'iot-gateway',
        region: ['us-east-1', 'eu-west-1', 'ap-south-1'][Math.floor(Math.random() * 3)]
      }
    };

    // Replace {random} placeholders
    const payloadStr = JSON.stringify(payload);
    const finalPayload = JSON.parse(payloadStr.replace(/\{random\}/g, () => Math.random().toString(36).substr(2, 9)));

    return {
      id: `failure-${String(index).padStart(6, '0')}`,
      orgId: orgIds[Math.floor(Math.random() * orgIds.length)],
      failureStatus: statuses[Math.floor(Math.random() * statuses.length)],
      createdDate: createdDate.toISOString(),
      endDate: endDate?.toISOString() || null,
      failurePayload: finalPayload
    };
  });
};

export const getAllOrgIds = (): string[] => orgIds;
export const getAllStatuses = (): string[] => statuses;
