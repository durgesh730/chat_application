import { Modal } from 'flowbite-react';
import CloseIcon from '@mui/icons-material/Close';

const ShowModal = ({
    children,
    isOpen,
    onClose,
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
                {children}
            </Modal.Body>
        </Modal>
    );
}

export default ShowModal;
