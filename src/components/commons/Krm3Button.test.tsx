import React from "react";
import Krm3Button from "./Krm3Button.tsx";
import {fireEvent, render, screen} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";

describe('Krm3Button', () => {
    const onClick = vi.fn()
    const props = {
        disabled: false,
        onClick: onClick,
        type: "button" as "button" | "submit",
        style: "primary" as "primary" | "secondary" | "danger",
        icon: <div>some icon</div>,
        disabledTooltipMessage: "is disabled",
        label: "some label",
        additionalStyles: "",
        id: "some id",
    }
    it("button is rendered properly", async () => {
        render(<Krm3Button {...props} />);
        expect(screen.getByText("some label")).toBeInTheDocument()
        expect(screen.getByText("some icon")).toBeInTheDocument()
    })
    it("renders mobile label", () => {
        render(<Krm3Button {...props} mobileLabel={"some mobile label"}/>);
        expect(screen.getByText("some mobile label")).toBeInTheDocument()
    })

    it('should call onClick when clicked', () => {
        render(<Krm3Button {...props} />);
        fireEvent.click(screen.getByText("some label"))
        expect(onClick).toHaveBeenCalled()
    });
})