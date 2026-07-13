import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderFields } from "./renderFields";

describe("renderFields", () => {
  it("should render text", () => {
    const cmp = renderFields(true)
    render(cmp.text({value: 'Test'}))
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
});