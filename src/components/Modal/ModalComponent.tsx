import { Modal, Box } from "@mui/material";
import React from "react";

interface ModalComponentProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}

const ModalComponent = ({ open, onClose, children, style, className }: ModalComponentProps) => {

    const handleClose = () => {
        onClose();
    };
    

    return (
      <Modal open={open} onClose={handleClose} className={className}>
        <Box sx={style ?? {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: '4px',
          p: 4
        }} data-testid="iban-modal-content">{children}</Box>
      </Modal>
    );
  };
export default ModalComponent;
