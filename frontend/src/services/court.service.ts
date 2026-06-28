import api from './api'

export interface ContractResponse {
  id: number
  target_id: number
  target_title: string
  pledge_amount: number
  status: string
  created_at: string
}

export interface CourtVerdict {
  verdict: 'forgiven' | 'partial_deduction' | 'full_penalty'
  coins_deducted: number
  message: string
}

export async function createPledge(targetId: number, amount: number): Promise<ContractResponse> {
  const { data } = await api.post<ContractResponse>('/court/pledge', {
    target_id: targetId,
    pledge_amount: amount
  })
  return data
}

export async function getBreachedContracts(): Promise<ContractResponse[]> {
  const { data } = await api.get<ContractResponse[]>('/court/breached')
  return data
}

export async function submitPlea(contractId: number, pleaMessage: string): Promise<CourtVerdict> {
  const { data } = await api.post<CourtVerdict>('/court/judge', {
    contract_id: contractId,
    plea_message: pleaMessage
  })
  return data
}
