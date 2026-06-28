import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTargetStore } from '@/store/targetStore'
import TargetForm from '@/components/targets/TargetForm'
import type { TargetCreatePayload } from '@/types/target'
import { createPledge } from '@/services/court.service'

export default function CreateTarget() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const scheduledDateStr = searchParams.get('date')
  const addTarget = useTargetStore((s) => s.addTarget)

  async function handleSubmit(payload: TargetCreatePayload) {
    const pledgeAmount = payload.pledge_amount;
    delete payload.pledge_amount; // Remove it so backend doesn't complain if target API doesn't expect it
    
    const target = await addTarget(payload)
    if (pledgeAmount && pledgeAmount > 0) {
      await createPledge(target.id, pledgeAmount)
    }
    navigate('/targets')
  }

  // Pre-fill fields if we came from a specific date
  const initialData: any = {}
  if (scheduledDateStr) {
    initialData.scheduled_date = scheduledDateStr + 'T00:00:00Z'
    initialData.frequency = 'One Time'
  }

  return (
    <div className="px-8 py-8 max-w-lg">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl text-ash-100">New Target</h1>
        <p className="text-ash-400 text-sm mt-1">Define what you're committing to.</p>
      </div>

      <TargetForm 
        initial={initialData} 
        onSubmit={handleSubmit} 
        onCancel={() => navigate('/targets')} 
        submitLabel="Create Target" 
      />
    </div>
  )
}
