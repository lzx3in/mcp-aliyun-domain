import * as $Domain from '@alicloud/domain20180129';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createClient } from '../config.js';

const AvailMap: Record<string, string> = {
  '1': '可注册',
  '3': '预登记',
  '4': '可删除预订',
  '0': '不可注册',
  '-1': '异常',
  '-2': '暂停注册',
  '-3': '黑名单',
};

export function registerCheckDomain(server: McpServer) {
  server.registerTool(
    'check_domain',
    {
      title: '检查域名可用性',
      description: '通过阿里云检查域名是否可注册。返回可用性状态、是否溢价域名以及不可注册原因。',
      inputSchema: {
        domainName: z.string().describe('要查询的域名，例如: example.com'),
        feeCommand: z.enum(['create', 'renew', 'transfer', 'restore'])
          .optional()
          .describe('操作类型: create（注册，默认）、renew（续费）、transfer（转入）、restore（恢复）'),
        feePeriod: z.number().int().min(1).max(10)
          .optional()
          .describe('注册年限（1-10年，默认1年）'),
      },
    },
    async ({ domainName, feeCommand = 'create', feePeriod = 1 }) => {
      try {
      const client = await createClient();

      const req = new $Domain.CheckDomainRequest();
      req.domainName = domainName;
      req.feeCommand = feeCommand;
      req.feePeriod = feePeriod;
      req.lang = 'zh';

      const resp = await client.checkDomain(req);
      const body = resp.body;
      const availText = AvailMap[String(body?.avail)] ?? '未知';

      let text = `域名: ${body?.domainName ?? domainName}\n`;
      text += `可用性: ${availText} (code: ${body?.avail})\n`;

      if (body?.premium === 'true') {
        text += `⚠️ 溢价域名: 是（价格高于普通域名）\n`;
      }

      if (body?.reason) {
        text += `\n不可注册原因: ${body.reason}\n`;
      }

      if (body?.avail === '1') {
        text += `\n✅ 该域名可以注册！\n`;
        text += `建议使用 create_order 工具创建注册订单\n`;
      }

      return {
        content: [{ type: 'text', text }],
      };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text',
            text: `❌ 查询域名可用性失败: ${errorMessage}\n\n请检查:\n1. 网络连接是否正常\n2. 阿里云凭证是否配置正确\n3. 域名格式是否正确`,
          }],
        };
      }
    }
  );
}
