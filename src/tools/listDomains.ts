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

export function registerListDomains(server: McpServer) {
  server.registerTool(
    'list_domains',
    {
      title: '列出域名列表',
      description: '列出阿里云账号下的所有域名，支持分页和关键词搜索。显示域名、到期时间、状态和审核信息。',
      inputSchema: {
        pageNum: z.number().int().min(1)
          .optional()
          .describe('页码（默认1）'),
        pageSize: z.number().int().min(1).max(20)
          .optional()
          .describe('每页数量（默认20，最大20）'),
        keyWord: z.string()
          .optional()
          .describe('搜索关键词，用于过滤域名'),
      },
    },
    async ({ pageNum, pageSize, keyWord }) => {
      try {
      const client = await createClient();

      const req = new $Domain.QueryDomainListRequest();
      req.pageNum = pageNum ?? 1;
      req.pageSize = pageSize ?? 20;
      req.lang = 'zh';
      if (keyWord) {
        req.keyWord = keyWord;
      }

      const resp = await client.queryDomainList(req);
      const body = resp.body;
      // 修复：数据在 body.data.domain 中
      const data = body?.data?.domain ?? [];
      const totalItem = body?.totalItemNum ?? 0;

      if (!data.length) {
        return {
          content: [{ type: 'text', text: '未找到域名' }],
        };
      }

      let text = `域名列表 (共 ${totalItem} 个，第 ${body?.currentPageNum ?? pageNum ?? 1} 页):\n`;
      text += `${'='.repeat(50)}\n`;

      for (const d of data) {
        let line = `• ${d.domainName}`;
        if (d.expirationDate) line += ` [到期: ${d.expirationDate}]`;
        if (d.domainStatus) line += ` (状态: ${d.domainStatus})`;
        if (d.domainAuditStatus) line += ` [审核: ${d.domainAuditStatus}]`;
        if (d.autoRenewEnabled !== undefined) line += ` [自动续费: ${d.autoRenewEnabled ? '开启' : '关闭'}]`;
        text += line + '\n';
      }

      return {
        content: [{ type: 'text', text }],
      };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{
            type: 'text',
            text: `❌ 列出域名失败: ${errorMessage}\n\n请检查:\n1. 阿里云凭证是否正确\n2. 是否有域名权限`,
          }],
        };
      }
    }
  );
}
