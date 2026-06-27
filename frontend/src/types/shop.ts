export interface ShopItem {
  id: number
  name: string
  description: string
  icon: string | null
  item_type: 'streak_freeze' | 'xp_boost' | 'theme' | 'avatar_frame' | 'badge_slot'
  price: number
  effect_value: string | null
  is_purchased: boolean
  can_afford: boolean
}

export interface ShopResponse {
  coins: number
  items: ShopItem[]
}

export interface Purchase {
  id: number
  item_id: number
  item_name: string
  item_icon: string | null
  item_type: string
  effect_value: string | null
  purchased_at: string
}
