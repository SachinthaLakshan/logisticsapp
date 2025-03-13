"use client"
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, TableCaption } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import api from '../lib/axios';
import Loader3 from '../components/loader/loader3';

const AdminDriversPage = () => {
    const [drivers, setDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        getAllDrivers();
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
        setDrivers(drivers.filter(vehicle => vehicle.id !== id));
        console.log('Delete Vehicle', id);
    };

    const getAllDrivers = async () => {
        try {
            const response = await api.get(`admin/getalldrivers`);
            if (response) {
                if (response.data) {
                    console.log(response.data);

                    setDrivers(response.data);
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
                Drivers Management
            </Heading>
            {/* <Box mb={4}>
                <Button colorScheme="teal" onClick={handleAddVehicle} mr={2}>
                    Page action 01
                </Button>
                <Button colorScheme="blue" mr={2}>
                    Page action 02
                </Button>
                <Button colorScheme="red">
                    Page action 03
                </Button>
            </Box> */}
            <Table variant="striped" colorScheme="gray">
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Phone Number</Th>
                        <Th>Vehicle</Th>
                        <Th>On trip</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {drivers.map(user => (
                        <Tr key={user._id}>
                            <Td fontSize={12}>{user.fullName}</Td>
                            <Td fontSize={12}>{user.email}</Td>
                            <Td>{user.contactNumber}</Td>
                            <Td>{user.vehicleDetails?.licensePlateNumber}</Td>
                            <Td>Yes</Td>
                            <Td>
                                <Button
                                    colorScheme="yellow"
                                    onClick={() => handleEditVehicle(user._id)}
                                    mr={2}
                                >
                                    Edit
                                </Button>
                                <Button
                                    colorScheme="red"
                                    onClick={() => handleDeleteVehicle(user._id)}
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

export default AdminDriversPage;