import * as $Domain from '@alicloud/domain20180129';
import { $OpenApiUtil } from '@alicloud/openapi-core';
import Credentials from '@alicloud/credentials';

const Client = $Domain.default.default;

/**
 * Create an Alibaba Cloud Domain API client.
 * Credentials are resolved from environment variables first,
 * then fall back to @alicloud/credentials auto-discovery (ECS RAM Role, SSO, ~/.alibabacloud/credentials).
 * 
 * @returns Alibaba Cloud Domain API client instance
 * @throws Error if credentials cannot be found or client creation fails
 */
export async function createClient() {
  const accessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;
  const securityToken = process.env.ALIBABA_CLOUD_SECURITY_TOKEN;

  try {
    if (accessKeyId && accessKeySecret) {
      const config = new $OpenApiUtil.Config({
        accessKeyId,
        accessKeySecret,
        securityToken,
        endpoint: 'domain.aliyuncs.com',
      });
      return new Client(config);
    }

    // Fallback: auto-discovery via @alicloud/credentials
    console.error('No explicit credentials found, attempting auto-discovery...');
    const DefaultProvider = Credentials.default;
    const provider = new DefaultProvider();
    const cred = await provider.getCredential();

    if (!cred.accessKeyId || !cred.accessKeySecret) {
      throw new Error(
        'Alibaba Cloud credentials not found. Please configure credentials using one of the following methods:\n' +
        '1. Set environment variables: ALIBABA_CLOUD_ACCESS_KEY_ID and ALIBABA_CLOUD_ACCESS_KEY_SECRET\n' +
        '2. Create ~/.alibabacloud/credentials file\n' +
        '3. Configure Alibaba Cloud CLI\n' +
        '4. Run on Alibaba Cloud ECS with RAM role'
      );
    }

    const credConfig = new $OpenApiUtil.Config({
      accessKeyId: cred.accessKeyId,
      accessKeySecret: cred.accessKeySecret,
      securityToken: cred.securityToken,
      type: cred.type,
      endpoint: 'domain.aliyuncs.com',
    });
    return new Client(credConfig);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to create Alibaba Cloud client: ${error.message}`);
      throw error;
    }
    throw new Error('Unknown error occurred while creating Alibaba Cloud client');
  }
}
