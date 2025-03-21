import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
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
    transition,
    isDragging,
    isOver
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
    marginBottom: '1rem',
    position: 'relative' as const,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.12)' : (isOver ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'),
    background: isOver ? 'rgba(249, 250, 251, 0.8)' : 'transparent',
    borderRadius: '0.375rem',
    padding: isOver ? '0.25rem' : '0',
    margin: isOver ? '-0.25rem' : '0'
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
  const [activeId, setActiveId] = useState<number | null>(null);
  
  // Find the active event
  const activeEvent = activeId ? items.find(item => item.id === activeId) : null;

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

  // Handle start of drag event
  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id;
    setActiveId(Number(id));
  };

  // Handle the end of a drag event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
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
      
      {/* Overlay to show while dragging */}
      <DragOverlay adjustScale={true}>
        {activeId && activeEvent ? (
          <div style={{ 
            opacity: 0.8, 
            transform: 'scale(1.05)',
            pointerEvents: 'none',
            width: '100%'
          }}>
            <TimelineEventCard
              event={activeEvent}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}