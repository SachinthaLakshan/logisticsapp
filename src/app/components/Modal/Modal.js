'use client'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Select,
    Button, } from '@chakra-ui/react';


const ModalComponent = ({body,isOpen,onClose,actionButtonFunction,actionButtonLabel,title}) => {

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>{title}</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                {body}
                            </ModalBody>
        
                            <ModalFooter>
                                <Button colorScheme="blue" mr={3} onClick={actionButtonFunction}>
                                    {actionButtonLabel}
                                </Button>
                                <Button variant="ghost" onClick={onClose}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
    );
};

export default ModalComponent;
