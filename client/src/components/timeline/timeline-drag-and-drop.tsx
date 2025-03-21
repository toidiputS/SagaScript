import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TimelineEvent } from '@shared/schema';
import TimelineEventCard from './timeline-event-card';

interface TimelineDragAndDropProps {
  events: TimelineEvent[];
  onEventReorder: (reorderedEvents: TimelineEvent[]) => void;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: number) => void;
}

// Sortable item wrapper component
interface SortableItemProps {
  id: number;
  event: TimelineEvent;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: number) => void;
}

function SortableItem({ id, event, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    marginBottom: '1rem',
    position: 'relative' as const
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TimelineEventCard
        event={event}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

export default function TimelineDragAndDrop({
  events,
  onEventReorder,
  onEdit,
  onDelete
}: TimelineDragAndDropProps) {
  const [items, setItems] = useState(events);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle the end of a drag event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex(item => item.id === active.id);
        const newIndex = currentItems.findIndex(item => item.id === over.id);
        
        const reorderedItems = arrayMove(currentItems, oldIndex, newIndex);
        
        // Update position values for each item based on new order
        const updatedItems = reorderedItems.map((item, index) => ({
          ...item,
          position: index + 1
        }));
        
        // Notify parent component about the reordering
        onEventReorder(updatedItems);
        
        return updatedItems;
      });
    }
  };

  // Update local items when props change
  React.useEffect(() => {
    setItems(events);
  }, [events]);

  // If there are no events, show a message
  if (items.length === 0) {
    return (
      <div className="px-4 py-6 bg-gray-50 border border-gray-200 rounded-md text-center">
        <p className="text-sm text-gray-500">No events yet. Add an event to start building your timeline.</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0">
          {items.map((event) => (
            <SortableItem
              key={event.id}
              id={event.id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}