import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTargetStore } from '@/store/targetStore'
import TargetForm from '@/components/targets/TargetForm'
import Loader from '@/components/common/Loader'
import type { TargetCreatePayload } from '@/types/target'
import { createPledge } from '@/services/court.service'

export default function EditTarget() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { targets, fetchTargets, editTarget } = useTargetStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (targets.length === 0) {
      fetchTargets().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [targets.length, fetchTargets])

  const target = targets.find((t) => t.id === Number(id))

  async function handleSubmit(payload: TargetCreatePayload) {
    if (!target) return
    const pledgeAmount = payload.pledge_amount;
    delete payload.pledge_amount;

    await editTarget(target.id, payload)
    
    if (pledgeAmount && pledgeAmount > 0) {
      try {
        await createPledge(target.id, pledgeAmount)
      } catch (e) {
        console.log('Could not create pledge (might already exist)')
      }
    }
    
    navigate('/targets')
  }

  if (isLoading) return <Loader label="Loading target..." />

  if (!target) {
    return (
      <div className="px-8 py-8">
        <p className="text-ash-400">Target not found.</p>
      </div>
    )
  }

  return (
    <div className="px-8 py-8 max-w-lg">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl text-ash-100">Edit Target</h1>
        <p className="text-ash-400 text-sm mt-1">Update the details of this target.</p>
      </div>

      <TargetForm
        initial={target}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/targets')}
        submitLabel="Save Changes"
      />
    </div>
  )
}
