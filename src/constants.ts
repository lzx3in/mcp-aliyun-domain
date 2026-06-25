// 域名可用性状态映射
export const AvailMap: Record<string, string> = {
  '1': '可注册',
  '3': '预登记',
  '4': '可删除预订',
  '0': '不可注册',
  '-1': '异常',
  '-2': '暂停注册',
  '-3': '黑名单',
};

// 域名状态映射
export const DomainStatusMap: Record<string, string> = {
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
export const EmailVerifyStatusMap: Record<string, string> = {
  '0': '未验证',
  '1': '已验证',
  '2': '验证中',
  '3': '验证失败',
};
