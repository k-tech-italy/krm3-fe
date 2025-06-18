import React from "react";
import { useDraggable } from "@dnd-kit/core";

export function Draggable(props: {
  children: React.ReactNode;
  id: string;
  className?: string;
  isDisabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: props.id,
    disabled: props.isDisabled, // This prevents dragging when disabled
  });

  return (
    <div
      id={`${props.id}`}
      ref={setNodeRef}
      className={`w-full h-full  ${
        props.isDisabled
          ? "draggable-disabled"
          : "cursor-grab active:cursor-grabbing"
      } ${props.className ? props.className : ""}`}
      {...(props.isDisabled ? {} : listeners)} // Only apply listeners when not disabled
      {...(props.isDisabled ? {} : attributes)} // Only apply attributes when not disabled
    >
      {props.children}
    </div>
  );
}
