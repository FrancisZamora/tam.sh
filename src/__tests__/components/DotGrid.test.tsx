/* eslint-disable react/display-name */
import React from "react";
import { render } from "@testing-library/react";
import DotGrid from "@/components/DotGrid";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(
      (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        { children, whileHover, initial, animate, exit, transition, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>,
        ref: React.Ref<HTMLDivElement>
      ) => (
        <div ref={ref} {...props}>
          {children}
        </div>
      )
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const segments = [
  { id: "a", name: "Segment A", count: 700, color: "#22c55e" },
  { id: "b", name: "Segment B", count: 300, color: "#ef4444" },
];

describe("DotGrid", () => {
  it("renders the correct number of dots", () => {
    const { container } = render(
      <DotGrid segments={segments} totalPopulation={1000} dotCount={100} />
    );

    const grid = container.querySelector(".grid");
    expect(grid).not.toBeNull();
    const dots = grid!.children;
    expect(dots.length).toBe(100);
  });

  it("assigns colors proportionally", () => {
    const { container } = render(
      <DotGrid segments={segments} totalPopulation={1000} dotCount={10} />
    );

    const grid = container.querySelector(".grid")!;
    const dots = Array.from(grid.children) as HTMLElement[];

    const greenDots = dots.filter(
      (d) => d.style.backgroundColor === "rgb(34, 197, 94)" || d.style.backgroundColor === "#22c55e"
    );
    const redDots = dots.filter(
      (d) => d.style.backgroundColor === "rgb(239, 68, 68)" || d.style.backgroundColor === "#ef4444"
    );

    // 70% of 10 = 7 green, 30% of 10 = 3 red
    expect(greenDots.length).toBe(7);
    expect(redDots.length).toBe(3);
  });

  it("renders with single segment", () => {
    const single = [{ id: "x", name: "Only", count: 100, color: "#3b82f6" }];
    const { container } = render(
      <DotGrid segments={single} totalPopulation={100} dotCount={25} />
    );

    const grid = container.querySelector(".grid")!;
    expect(grid.children.length).toBe(25);
  });

  it("sets grid columns based on sqrt of dotCount", () => {
    const { container } = render(
      <DotGrid segments={segments} totalPopulation={1000} dotCount={100} />
    );

    const grid = container.querySelector(".grid") as HTMLElement;
    // sqrt(100) = 10
    expect(grid.style.gridTemplateColumns).toBe("repeat(10, 1fr)");
  });
});
