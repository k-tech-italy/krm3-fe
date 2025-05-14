import React from "react";
import { useDraggable } from "@dnd-kit/core";

export function Draggable(props: { children: React.ReactNode; id: string, className?: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: props.id,
  });
  

  return (
    <div
      id={`draggable-${props.id}`}
      ref={setNodeRef}
      className={`h-full w-full ` + props.className || ""}
      {...listeners}
      {...attributes}
    >
      {props.children}
    </div>
  );
}
