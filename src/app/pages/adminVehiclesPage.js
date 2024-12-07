"use client"
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, TableCaption } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import api from '../lib/axios';
import Loader3 from '../components/loader/loader3';

const AdminVehiclesPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAllVehicles();
    }, []);

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
        setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
        console.log('Delete Vehicle', id);
    };

    const getAllVehicles = async () => {
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
                Vehicles Management
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
                        <Th>Number</Th>
                        <Th>Current Capacity</Th>
                        <Th>Max Capacity</Th>
                        <Th>Vehicle Type</Th>
                        <Th>Container Dimensions (m)</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {vehicles.map(vehicle => (
                        <Tr key={vehicle._id}>
                            <Td>{vehicle.licensePlateNumber}</Td>
                            <Td>{vehicle.containerCapacity}</Td>
                            <Td>{vehicle.maximumLoadCapacity}</Td>
                            <Td>{vehicle.vehicleType}</Td>
                            <Td>{vehicle.width} x {vehicle.height} x {vehicle.length}</Td>
                            <Td>
                                <Button
                                    colorScheme="yellow"
                                    onClick={() => handleEditVehicle(vehicle._id)}
                                    mr={2}
                                >
                                    Edit
                                </Button>
                                <Button
                                    colorScheme="red"
                                    onClick={() => handleDeleteVehicle(vehicle._id)}
                                >
                                    Delete
                                </Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            {isLoading && <Loader3 />}
        </Box>

    );
};

export default AdminVehiclesPage;