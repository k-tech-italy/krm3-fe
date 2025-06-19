import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function Droppable(props: {
  children: React.ReactNode;
  id: string;
  isDisabled?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
    disabled: props.isDisabled,
  });

  return (
    <div
      id={`droppable-${props.id}`}
      className={`w-full h-full relative ${
        props.isDisabled ? "linear-gradient-disabled" : ""
      }`}
      ref={setNodeRef}
    >
      {props.children}
    </div>
  );
}
