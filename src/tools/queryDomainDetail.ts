import * as $Domain from '@alicloud/domain20180129';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createClient } from '../config.js';

// 域名状态映射
const DomainStatusMap: Record<string, string> = {
  '1': '需要设置DNS',
  '2': '需要实名认证',
  '3': '正常',
  '4': '需要续费',
  '5': '过期删除期',
  '6': '等待赎回',
  '7': '注册局锁定',
  '8': '注册局设置删除期',
  '9': '注册商设置删除期',
};

// 邮箱验证状态映射
const EmailVerifyStatusMap: Record<string, string> = {
  '0': '未验证',
  '1': '已验证',
  '2': '验证中',
  '3': '验证失败',
};

export function registerQueryDomainDetail(server: McpServer) {
  server.registerTool(
    'query_domain_detail',
    {
      title: '查询域名详情',
      description: '查询阿里云账号下指定域名的详细信息，包括注册者信息、到期时间、验证状态、DNS设置和管理状态等。',
      inputSchema: {
        domainName: z.string().describe('要查询的域名，例如: example.com'),
      },
    },
    async ({ domainName }) => {
      try {
      const client = await createClient();

      const req = new $Domain.QueryDomainByDomainNameRequest();
      req.domainName = domainName;
      req.lang = 'zh';

      const resp = await client.queryDomainByDomainName(req);
      const body = resp.body;
      const d = body;

      // 修复：检查域名是否存在于账号中
      if (!d || !d.domainName) {
        return {
          content: [{ type: 'text', text: `❌ 未找到域名 "${domainName}" 的信息

可能原因：
1. 该域名不在您的阿里云账号下
2. 域名拼写错误
3. 您没有该域名的管理权限

提示：请使用 check_domain 工具检查域名是否可注册` }],
        };
      }

      let text = `域名详情: ${d.domainName}\n`;
      text += `${'='.repeat(40)}\n`;

      // 基本信息
      if (d.zhRegistrantName) text += `注册者: ${d.zhRegistrantName}\n`;
      if (d.zhRegistrantOrganization) text += `组织: ${d.zhRegistrantOrganization}\n`;
      if (d.email) text += `邮箱: ${d.email}\n`;
      if (d.expirationDate) text += `到期时间: ${d.expirationDate}\n`;
      if (d.registrationDate) text += `注册时间: ${d.registrationDate}\n`;
      if (d.domainStatus) text += `状态: ${DomainStatusMap[String(d.domainStatus)] || d.domainStatus}\n`;
      
      // 验证状态
      if (d.domainNameVerificationStatus) text += `域名验证: ${d.domainNameVerificationStatus}\n`;
      if (d.realNameStatus) text += `实名认证: ${d.realNameStatus}\n`;
      if (d.emailVerificationStatus !== undefined) text += `邮箱验证: ${EmailVerifyStatusMap[String(d.emailVerificationStatus)] || d.emailVerificationStatus}\n`;
      if (d.domainNameProxyService !== undefined) text += `WHOIS 保护: ${d.domainNameProxyService ? '开启' : '关闭'}\n`;
      
      // DNS
      if (d.dnsList?.dns) {
        text += `DNS1: ${d.dnsList.dns[0] || 'N/A'}\n`;
        text += `DNS2: ${d.dnsList.dns[1] || 'N/A'}\n`;
      }
      
      // 其他信息
      if (d.instanceId) text += `实例ID: ${d.instanceId}\n`;
      if (d.domainType) text += `域名类型: ${d.domainType}\n`;
      if (d.expirationCurrDateDiff !== undefined) text += `距离到期: ${d.expirationCurrDateDiff} 天\n`;
      
      // 管理状态
      text += `\n管理状态:\n`;
      if (d.autoRenewEnabled !== undefined) text += `  自动续费: ${d.autoRenewEnabled ? '开启' : '关闭'}\n`;
      if (d.transferProhibitionLock) text += `  转移锁: ${d.transferProhibitionLock === 'CLOSE' ? '关闭' : '开启'}\n`;
      if (d.updateProhibitionLock) text += `  更新锁: ${d.updateProhibitionLock === 'CLOSE' ? '关闭' : '开启'}\n`;
      if (d.resourceGroupId) text += `  资源组: ${d.resourceGroupId}\n`;
      return {
        content: [{ type: 'text', text }],
      };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text',
            text: `❌ 查询域名详情失败: ${errorMessage}\n\n请检查:\n1. 域名是否存在\n2. 阿里云凭证是否正确`,
          }],
        };
      }
    }
  );
}
