/** @var サブスクリプションのステータス */
export const SubscriptionStatus = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

/** @var サブスクリプションのステータスに対応する文言 */
export const SubscStatusToText = {
  [SubscriptionStatus.TRIAL]: 'トライアル',
  [SubscriptionStatus.ACTIVE]: '利用中',
  [SubscriptionStatus.SUSPENDED]: '一時停止',
  [SubscriptionStatus.CANCELLED]: 'キャンセル',
  [SubscriptionStatus.EXPIRED]: '期限切れ',
} as const;

/** @var サブスクリプションの支払い頻度 */
export const SubscriptionFrequency = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

/** @var サブスクリプションの日額・月額・年額の切り替えスイッチ */
export const SubscriptionFreqDisplay = {
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year',
} as const;
