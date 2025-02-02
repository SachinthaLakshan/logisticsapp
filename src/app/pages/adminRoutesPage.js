"use client"
import {
    Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, TableCaption, useDisclosure,
    // Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Select,
    Input,
    Modal,
    Card,
    CardBody,
    Text,
    CardHeader,
    Flex,
    Center
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import Loader3 from '../components/loader/loader3';
import api from '../lib/axios';
import ModalComponent from '../components/Modal/Modal';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { FaMapPin, FaRegTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminRoutesPage = () => {
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [waypoints, setWaypoints] = useState([]);
    const [route, setRoute] = useState({
        origin: "",
        destination: "",
        waypoints: [],
        lorryCapacity: 0,
        vehicle: "",
        startDate: new Date(),
        endDate: new Date()
    });
    const libraries = ['places'];
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process?.env?.NEXT_PUBLIC_API_KEY,
        libraries
    })
    /** @type React.MutableRefObject<HTMLInputElement> */
    const originRef = useRef()
    /** @type React.MutableRefObject<HTMLInputElement> */
    const destiantionRef = useRef()
    /** @type React.MutableRefObject<HTMLInputElement> */
    const waypointRef = useRef()
    const { isOpen: assignVehicleModalIsOpen, onOpen: assignVehicleModalOnOpen, onClose: assignVehicleModalOnClose } = useDisclosure();
    const { isOpen: addRouteModalIsOpen, onOpen: addRouteModalOnOpen, onClose: addRouteModalOnClose } = useDisclosure();

    useEffect(() => {
        getAllRoutes();
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(route.origin == '') {
            toast.error("Origin loaction is required");
            return;
        }else if(route.destination == '') {
            toast.error("Destination location is required");
            return;
        }else if (route.lorryCapacity == 0) {
            toast.error("Lorry capacity is required");
            return;
        }

        try {
            let data = {
                origin: originRef.current.value,
                destination: destiantionRef.current.value,
                waypoints,
                vehicle: selectedVehicle,
                startDate: route.startDate,
                endDate: route.endDate,
                lorryCapacity: route.lorryCapacity

            };
            const response = await api.post('/direction/create', data);
            if (response) {
                toast.success("Register Successful!");
                originRef.current.value = '';
                destiantionRef.current.value = '';
                waypointRef.current.value = '';
                setRoute({
                    origin: "",
                    destination: "",
                    waypoints: [],
                    lorryCapacity: 0,
                    vehicle: "",
                    startDate: new Date(),
                    endDate: new Date()
                });
                setWaypoints([]);
            }

        } catch (err) {
            console.error("Registration failed:", err);
            toast.error(err.response.data.message);
        }
    };

    const handleAddWaypoint = () => {

        setWaypoints([...waypoints, waypointRef.current.value]);
        waypointRef.current.value = null;

    };

    const handleRemoveWaypoint = (index) => {
        const newWaypoints = [...waypoints];
        newWaypoints.splice(index, 1);
        setWaypoints(newWaypoints);
    }

    const AssignVehicleModalBody = () => (
        
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
    )


    return (
        <Box padding={4}>
            <Center>
                <Heading as="h1" size="lg" mb={4}>
                    Routes Management
                </Heading>
            </Center>
            <Box mb={4}>
                {/* <Button colorScheme="teal" onClick={addRouteModalOnOpen} mr={2}>
                    Add New Route
                </Button>
                <Button colorScheme="blue" mr={2}>
                    Page action 02
                </Button>
                <Button colorScheme="red">
                    Page action 03
                </Button> */}
            </Box>
            <Card marginBottom={6}>
                <Heading as="h2" size="md" mb={4}>Add New Route</Heading>
                <hr></hr>
                <CardBody>
                    <div>
                        {isLoaded && <FormControl>
                            <Flex width={'full'} gap={10}>
                                <Flex flexDirection="column" width={'50%'}>
                                    <FormLabel>Origin</FormLabel>
                                    <Autocomplete>
                                        <Input type="text" placeholder="Origin" ref={originRef} />
                                    </Autocomplete>
                                </Flex>
                                <Flex flexDirection="column" width={'50%'}>
                                    <FormLabel>Destination</FormLabel>
                                    <Autocomplete>
                                        <Input type="text" placeholder="Destination" ref={destiantionRef} />
                                    </Autocomplete>
                                </Flex>
                            </Flex>
                            <Flex marginTop={2} width={'full'} gap={10}>
                                <Flex flexDirection="column" width={'50%'}>
                                    <FormLabel>Start Date</FormLabel>
                                    <Input type="date" value={route.startDate} onChange={(e) => setRoute({ ...route, startDate: e.target.value })} />
                                </Flex>
                                <Flex flexDirection="column" width={'50%'}>
                                    <FormLabel>End Date</FormLabel>
                                    <Input type="date" value={route.endDate} onChange={(e) => setRoute({ ...route, endDate: e.target.value })} />
                                </Flex>
                            </Flex>
                            <FormLabel marginTop={2}>Select Vehicle</FormLabel>
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
                            <FormLabel marginTop={2}>Available Space (meeter cubes)</FormLabel>
                            <Input
                                type="text"
                                value={route.availableSpace}
                                onChange={(e) => setRoute({ ...route, availableSpace: e.target.value })}
                            />
                            <FormLabel marginTop={2}>Add Waypoints</FormLabel>
                            <Flex marginTop={2} width={'full'} gap={10}>
                                <Autocomplete>
                                    <Input type="text" placeholder="Add waypoint" ref={waypointRef} />
                                </Autocomplete>

                                <Button onClick={handleAddWaypoint} colorScheme="teal">
                                    Add Waypoint
                                </Button>
                            </Flex>


                            <Box marginLeft={4}>
                                {waypoints.length > 0 && (
                                    <Box mt={2} mb={5}>
                                        <Heading size="sm">Waypoints:</Heading>
                                        {waypoints.map((waypoint, index) => (
                                            <Box key={index} p={1} borderRadius="md" display={"flex"} flexDirection={"row"} alignItems={"center"} my={1}>
                                                <FaMapPin className='mr-2' />
                                                {waypoint}
                                                <FaRegTimesCircle color='red' cursor={'pointer'} onClick={() => handleRemoveWaypoint(index)} className='ml-2' />
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                            <Box display="flex" alignItems="end" justifyContent="flex-end">
                                <Button
                                    borderRadius="md"
                                    type="submit"
                                    colorScheme="blue"
                                    marginTop={4}
                                    onClick={handleSubmit}
                                >
                                    Save Route
                                </Button>
                            </Box>
                        </FormControl>}
                    </div>
                </CardBody>
            </Card>
            <Heading as="h2" size="md" mb={4}>Available Routes</Heading>
            <hr></hr>
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
                                    onClick={assignVehicleModalOnOpen}
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
            <ModalComponent body={AssignVehicleModalBody()} isOpen={assignVehicleModalIsOpen} onClose={assignVehicleModalOnClose} actionButtonFunction={handleAssign} actionButtonLabel="Assign to Route" title="Assign Vehicle" />
            {isLoading && <Loader3 />}
        </Box>
    );
};

export default AdminRoutesPage;