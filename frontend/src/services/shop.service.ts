import api from './api'
import type { ShopResponse, Purchase } from '@/types/shop'

export async function getShopItems(): Promise<ShopResponse> {
  const { data } = await api.get<ShopResponse>('/shop/items')
  return data
}

export async function buyItem(itemId: number): Promise<{ detail: string; coins_remaining: number; streak_freezes: number; item: { id: number; name: string; icon: string | null; item_type: string; effect_value: string | null } }> {
  const { data } = await api.post('/shop/buy', { item_id: itemId })
  return data
}

export async function getMyPurchases(): Promise<{ purchases: Purchase[] }> {
  const { data } = await api.get('/shop/my-purchases')
  return data
}

export async function claimMonthlyReward(): Promise<{ detail: string; coins_remaining: number; last_monthly_reward_claim: string }> {
  const { data } = await api.post('/shop/claim-monthly-reward')
  return data
}
