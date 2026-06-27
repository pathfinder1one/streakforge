import type { Target } from '@/types/target'
import TargetCard from './TargetCard'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface TargetListProps {
  targets: Target[]
  onDelete: (id: number) => void
  onReorder?: (targets: Target[]) => void
}

export default function TargetList({ targets, onDelete, onReorder }: TargetListProps) {
  if (targets.length === 0) {
    return (
      <div className="rounded-2xl border p-10 text-center bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
        <p className="text-ash-400 text-sm">No targets yet. Create your first one to start a streak.</p>
      </div>
    )
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorder) return
    const startIndex = result.source.index
    const endIndex = result.destination.index

    if (startIndex === endIndex) return

    const newTargets = Array.from(targets)
    const [removed] = newTargets.splice(startIndex, 1)
    newTargets.splice(endIndex, 0, removed)

    onReorder(newTargets)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="targets-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {targets.map((t, index) => (
              <Draggable key={t.id} draggableId={t.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? 'z-50 relative drop-shadow-2xl opacity-90' : ''}
                    style={{ ...provided.draggableProps.style }}
                  >
                    <TargetCard target={t} onDelete={onDelete} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
