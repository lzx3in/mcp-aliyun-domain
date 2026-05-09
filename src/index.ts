#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCheckDomain } from './tools/checkDomain.js';
import { registerQueryDomainDetail } from './tools/queryDomainDetail.js';
import { registerListDomains } from './tools/listDomains.js';
import { registerCreateOrder } from './tools/createOrder.js';

const server = new McpServer({
  name: 'mcp-aliyun-domain',
  version: '0.1.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Register tools
registerCheckDomain(server);
registerQueryDomainDetail(server);
registerListDomains(server);
registerCreateOrder(server);

// Start stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('mcp-aliyun-domain server started (stdio)');
