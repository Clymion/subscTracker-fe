export const SubscriptionStatus = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const SubscStatusToText = {
  [SubscriptionStatus.TRIAL]: 'トライアル',
  [SubscriptionStatus.ACTIVE]: '利用中',
  [SubscriptionStatus.SUSPENDED]: '一時停止',
  [SubscriptionStatus.CANCELLED]: 'キャンセル',
  [SubscriptionStatus.EXPIRED]: '期限切れ',
} as const;
