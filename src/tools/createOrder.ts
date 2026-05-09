import * as $Domain from '@alicloud/domain20180129';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createClient } from '../config.js';

export function registerCreateOrder(server: McpServer) {
  server.registerTool(
    'create_order',
    {
      title: '创建域名注册订单',
      description: '创建域名注册订单（警告：此操作涉及支付）。需要提供已创建的注册者模板ID。建议先使用 check_domain 确认可注册性。',
      inputSchema: {
        domainName: z.string().describe('要注册的域名'),
        period: z.number().int().min(1).max(10)
          .describe('注册年限（1-10年）'),
        registrantProfileId: z.number().int()
          .describe('注册者模板ID（需先在阿里云控制台创建）'),
        dns1: z.string()
          .optional()
          .describe('主DNS服务器（默认: ns1.aliyun.com）'),
        dns2: z.string()
          .optional()
          .describe('副DNS服务器（默认: ns2.aliyun.com）'),
        enableDomainProxy: z.boolean()
          .optional()
          .describe('是否开启WHOIS隐私保护（默认关闭）'),
        couponNo: z.string()
          .optional()
          .describe('优惠券代码（可选）'),
      },
    },
    async ({ domainName, period, registrantProfileId, dns1, dns2, enableDomainProxy, couponNo }) => {
      try {
      const client = await createClient();

      // First check availability
      const checkReq = new $Domain.CheckDomainRequest();
      checkReq.domainName = domainName;
      checkReq.feeCommand = 'create';
      checkReq.feePeriod = period;
      checkReq.lang = 'zh';

      const checkResp = await client.checkDomain(checkReq);
      const avail = String(checkResp.body?.avail);

      if (avail !== '1') {
        return {
          content: [{
            type: 'text',
            text: `⚠️ 域名 "${domainName}" 不可注册 (code: ${avail})，请先使用 check_domain 确认`,
          }],
        };
      }

      const req = new $Domain.SaveSingleTaskForCreatingOrderActivateRequest();
      req.domainName = domainName;
      req.subscriptionDuration = period;
      req.registrantProfileId = registrantProfileId;
      req.dns1 = dns1 ?? 'ns1.aliyun.com';
      req.dns2 = dns2 ?? 'ns2.aliyun.com';
      req.enableDomainProxy = enableDomainProxy ?? false;
      req.couponNo = couponNo ?? '';
      req.lang = 'zh';

      const resp = await client.saveSingleTaskForCreatingOrderActivate(req);
      const body = resp.body;

      let text = `域名注册任务已提交!\n`;
      text += `${'='.repeat(30)}\n`;
      if (body?.taskNo) text += `任务编号: ${body.taskNo}\n`;
      if (body?.taskStatus !== undefined) text += `任务状态: ${body.taskStatus}\n`;

      text += `\n⚠️ 请前往阿里云控制台完成支付和实名认证。\n`;

      return {
        content: [{ type: 'text', text }],
      };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text',
            text: `❌ 创建域名订单失败: ${errorMessage}\n\n请检查:\n1. 域名是否可注册\n2. 注册者模板ID是否正确\n3. 阿里云账户余额是否充足`,
          }],
        };
      }
    }
  );
}
