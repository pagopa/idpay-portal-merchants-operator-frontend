import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from "vitest";
import { DownloadFile } from "./DownloadFile"
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

describe("DownloadFile component", () => {
    it("should correctly render component", () => {
        const props = {
            isLoading: false,
            onClick: vi.fn(),
            text: "test download"
        }
        render(<DownloadFile { ...props} />)
        const btn = screen.getByTestId("btn-test")
        expect(screen.getByText("test download")).toBeInTheDocument()
        fireEvent.click(btn)
        expect(props.onClick).toHaveBeenCalled()
    })

    it("should correctly render component without text", () => {
        const props = {
            isLoading: false,
            onClick: () => {}
        }
        render(<DownloadFile { ...props} />)
        expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument()
    })

    it("should show loader", () => {
        const props = {
            isLoading: true,
            onClick: () => {}
        }
        render(<DownloadFile { ...props} />)
        expect(screen.getByTestId("item-loader")).toBeInTheDocument()
    })
})