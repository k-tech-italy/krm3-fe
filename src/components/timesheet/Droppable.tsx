import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function Droppable(props: { children: React.ReactNode; id: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div className="w-full h-full" ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}
