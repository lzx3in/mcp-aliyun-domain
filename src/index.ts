#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCheckDomain } from './tools/checkDomain.js';
import { registerQueryDomainDetail } from './tools/queryDomainDetail.js';
import { registerListDomains } from './tools/listDomains.js';
import { registerCreateOrder } from './tools/createOrder.js';

const server = new McpServer({
  name: 'mcp-aliyun-domain',
  version: pkg.version,
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
