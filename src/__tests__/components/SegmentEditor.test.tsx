import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SegmentEditor from "@/components/SegmentEditor";

const segments = [
  { id: "a", name: "Segment A", count: 700, color: "#22c55e" },
  { id: "b", name: "Segment B", count: 300, color: "#ef4444" },
];

describe("SegmentEditor", () => {
  it("renders all segments", () => {
    render(
      <SegmentEditor
        segments={segments}
        totalPopulation={1000}
        onSegmentsChange={jest.fn()}
        onTotalChange={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue("Segment A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Segment B")).toBeInTheDocument();
  });

  it("renders total population input", () => {
    render(
      <SegmentEditor
        segments={segments}
        totalPopulation={1000}
        onSegmentsChange={jest.fn()}
        onTotalChange={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue("1,000")).toBeInTheDocument();
  });

  it("calls onSegmentsChange when segment name changes", () => {
    const onChange = jest.fn();
    render(
      <SegmentEditor
        segments={segments}
        totalPopulation={1000}
        onSegmentsChange={onChange}
        onTotalChange={jest.fn()}
      />
    );

    const nameInput = screen.getByDisplayValue("Segment A");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "a", name: "Updated Name" }),
      ])
    );
  });

  it("calls onTotalChange when total population changes", () => {
    const onTotal = jest.fn();
    render(
      <SegmentEditor
        segments={segments}
        totalPopulation={1000}
        onSegmentsChange={jest.fn()}
        onTotalChange={onTotal}
      />
    );

    const totalInput = screen.getByDisplayValue("1,000");
    fireEvent.change(totalInput, { target: { value: "2000" } });

    expect(onTotal).toHaveBeenCalledWith(2000);
  });

  it("adds a new segment when clicking '+ Add Segment'", () => {
    const onChange = jest.fn();
    render(
      <SegmentEditor
        segments={segments}
        totalPopulation={1000}
        onSegmentsChange={onChange}
        onTotalChange={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("+ Add Segment"));

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "New Segment", count: 0 }),
      ])
    );
    // Should now have 3 segments
    expect(onChange.mock.calls[0][0]).toHaveLength(3);
  });

  it("removes a segment when clicking X button", () => {
    const onChange = jest.fn();
    render(
      <SegmentEditor
        segments={segments}
        totalPopulation={1000}
        onSegmentsChange={onChange}
        onTotalChange={jest.fn()}
      />
    );

    const removeButtons = screen.getAllByTitle("Remove segment");
    fireEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: "b", name: "Segment B" }),
    ]);
  });

  it("does not remove the last segment", () => {
    const single = [{ id: "x", name: "Only", count: 100, color: "#fff" }];
    const onChange = jest.fn();
    render(
      <SegmentEditor
        segments={single}
        totalPopulation={100}
        onSegmentsChange={onChange}
        onTotalChange={jest.fn()}
      />
    );

    const removeButton = screen.getByTitle("Remove segment");
    fireEvent.click(removeButton);

    expect(onChange).not.toHaveBeenCalled();
  });
});
