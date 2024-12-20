"use client"
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, TableCaption,useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Select, } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Loader3 from '../components/loader/loader3';
import api from '../lib/axios';

const AdminRoutesPage = () => {
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        getAllRoutes();
    },[]);
    const handleAddVehicle = () => {
        // Logic to add a new vehicle
        console.log('Add Vehicle');
    };

    const handleEditVehicle = (id) => {
        // Logic to edit vehicle with given id
        console.log('Edit Vehicle', id);
    };

    const handleDeleteVehicle = (id) => {
        // Logic to delete vehicle with given id
        setRoutes(routes.filter(vehicle => vehicle.id !== id));
        console.log('Delete Vehicle', id);
    };

    const getAllRoutes = async () => {
        try {
            const response = await api.get(`admin/getallroutes`);
            if (response) {
                if (response.data) {
                    setRoutes(response.data);
                    getAllVehicles();
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    };

    const handleAssign = () => {
        // Logic to add a new vehicle
        console.log('Add Vehicle');
    };

    const getAllVehicles = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`admin/getallvehicles`);
            if (response) {
                if (response.data) {
                    setVehicles(response.data);
                    setIsLoading(false);
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    };

    return (
        <Box padding={4}>
            <Heading as="h1" size="lg" mb={4}>
                Routes Management
            </Heading>
            <Box mb={4}>
                <Button colorScheme="teal" onClick={handleAddVehicle} mr={2}>
                    Page action 01
                </Button>
                {/* You can add more action buttons here if needed */}
                <Button colorScheme="blue" mr={2}>
                    Page action 02
                </Button>
                <Button colorScheme="red">
                    Page action 03
                </Button>
            </Box>
            <Table variant="striped" colorScheme="gray">
                <Thead>
                    <Tr>
                        <Th>Origin</Th>
                        <Th>Destination</Th>
                        <Th>Driver Confirmed</Th>
                        <Th>Vehicle On The Way</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {routes.map(route => (
                        <Tr key={route._id}>
                            <Td>{route.origin}</Td>
                            <Td>{route.destination}</Td>
                            <Td>{route.driverConfirmed ? 'Yes' : 'No'}</Td>
                            <Td>{route.onTheWay ? 'Yes' : 'No'}</Td>
                            <Td>{route.color}</Td>
                            <Td>
                                <Button 
                                    colorScheme="yellow" 
                                    onClick={onOpen}
                                    mr={2}
                                >
                                    Assign Vehicle
                                </Button>
                                <Button 
                                    colorScheme="red" 
                                    onClick={() => handleDeleteVehicle(route._id)}
                                >
                                    Delete
                                </Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Assign Vehicle</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Select Vehicle</FormLabel>
                            <Select
                                placeholder="Select vehicle"
                                value={selectedVehicle}
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                            >
                                {vehicles.map((vehicle) => (
                                    <option key={vehicle._id} value={vehicle._id}>
                                        {vehicle.licensePlateNumber}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleAssign}>
                            Assign to Route
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {isLoading && <Loader3/>}
        </Box>
    );
};

export default AdminRoutesPage;