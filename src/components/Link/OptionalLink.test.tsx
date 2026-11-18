import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OptionalLink } from "./OptionalLink";
import { renderText } from "../../utils/helpers";
import { Link } from "./Link";

vi.mock("../../utils/helpers", () => ({
  renderText: vi.fn(({ text }) => <span data-testid="rendered-text">{text}</span>),
}));

vi.mock("./Link", () => ({
  Link: vi.fn(({ label, href }) => <a data-testid="link" href={href}>{label}</a>),
}));

describe("OptionalLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Link component when value is a valid http URL", () => {
    render(<OptionalLink value="http://example.com" tooltip={true} name="link-name" />);
    
    expect(Link).toHaveBeenCalledTimes(1);
    expect(Link).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "http://example.com",
        href: "http://example.com",
        tooltip: true,
        name: "link-name",
      }),
      expect.any(Object)
    );
    expect(renderText).not.toHaveBeenCalled();
  });

  it("renders the Link component when value is a valid https URL", () => {
    render(<OptionalLink value="https://example.com" tooltip={false} />);
    
    expect(Link).toHaveBeenCalledTimes(1);
    expect(Link).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "https://example.com",
        href: "https://example.com",
        tooltip: false,
      }),
      expect.any(Object)
    );
    expect(renderText).not.toHaveBeenCalled();
  });

  it("prepends https:// when protocol regex check fails for a matched URL", () => {
    const originalTest = RegExp.prototype.test;
    RegExp.prototype.test = function (str) {
      if (this.source.includes("https?:\\/\\/(?:www\\.)?")) {
        return true;
      }
      if (this.source.includes("https?:\\/\\/") && this.flags.includes("i")) {
        return false;
      }
      return originalTest.call(this, str);
    };

    render(<OptionalLink value="example.com" />);

    expect(Link).toHaveBeenCalledTimes(1);
    expect(Link).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "example.com",
        href: "https://example.com",
      }),
      expect.any(Object)
    );

    RegExp.prototype.test = originalTest;
  });

  it("renders text using renderText when value is plain text", () => {
    render(<OptionalLink value="Just some text" tooltip={true} />);
    
    expect(renderText).toHaveBeenCalledTimes(1);
    expect(renderText).toHaveBeenCalledWith({
      text: "Just some text",
      tooltip: true,
      bold: true,
    });
    expect(Link).not.toHaveBeenCalled();
  });

  it("trims whitespace from the value before evaluation", () => {
    render(<OptionalLink value="   https://example.com   " />);
    
    expect(Link).toHaveBeenCalledTimes(1);
    expect(Link).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "https://example.com",
        href: "https://example.com",
      }),
      expect.any(Object)
    );
  });

  it("handles undefined value gracefully and calls renderText", () => {
    render(<OptionalLink />);
    
    expect(renderText).toHaveBeenCalledTimes(1);
    expect(renderText).toHaveBeenCalledWith({
      text: undefined,
      tooltip: undefined,
      bold: true,
    });
    expect(Link).not.toHaveBeenCalled();
  });
});