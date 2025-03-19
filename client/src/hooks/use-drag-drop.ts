import { useState } from "react";

export function useDragDrop() {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragEnter = (index: number) => {
    setDraggedOverItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  return {
    draggedItem,
    draggedOverItem,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
  };
}
