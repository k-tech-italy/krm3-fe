import React from "react";
import { useDraggable } from "@dnd-kit/core";

export function Draggable(props: { children: React.ReactNode; id: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        cursor: "grabbing",
      }
    : { cursor: "grab" };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}
