import { CircularProgress } from '@mui/material';
import { Button, Modal } from 'flowbite-react';
import CloseIcon from '@mui/icons-material/Close';

const WarningModal = ({
    isOpen,
    onClose,
    modalTitle,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    isLoading
}) => {
    return (
        <Modal
            show={isOpen}
            onClose={onClose}
            size="md"
            popup
            className='bg-opacity-50 '
        >
            <div onClick={onClose} className='p-2 flex justify-end cursor-pointer'>
                <CloseIcon />
            </div>
            <Modal.Body>
                <div className="text-center">
                    <div>
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        {modalTitle}
                    </h3>
                    <div className="flex justify-center gap-7">
                        <Button color="failure" onClick={onConfirm}>
                            {isLoading && <CircularProgress sx={{ color: "white" }} size={18} />}
                            {confirmText}
                        </Button>
                        <Button className='border border-gray-500' color="gray" onClick={onCancel}>
                            {cancelText}
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default WarningModal;
