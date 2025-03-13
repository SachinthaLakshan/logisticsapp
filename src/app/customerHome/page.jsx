'use client'
import { Box, Button, Flex, FormControl, FormLabel, Input, ListIcon, OrderedList, useDisclosure, } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
    useJsApiLoader,
    GoogleMap,
    Marker,
    Autocomplete,
    DirectionsRenderer,
} from '@react-google-maps/api'
import { useContext, useEffect, useRef, useState } from "react";
import { BounceLoader } from "react-spinners";
import Loader from "../components/loader/loader";
import MyComponent from "../components/map";
import { FaCalendarAlt, FaCar, FaClock, FaFlagCheckered, FaMapMarkerAlt, FaMapPin, FaRoad, FaSearch, FaTruck, FaUserCheck } from "react-icons/fa";
import {

    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Heading,
    Text,
    List,
    ListItem,
    useColorModeValue,
} from '@chakra-ui/react';
import api from "../lib/axios";
import { toast } from "react-toastify";
import Loader2 from "../components/loader/loader2";
import { useCookies } from "react-cookie";
import jwt from 'jsonwebtoken';
import ModalComponent from "../components/Modal/Modal";
import { SocketContext } from "../lib/socketContext";
const Page = () => {
    const cardBg = useColorModeValue('#3A3D42', '#2F3136');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [map, setMap] = useState(/** @type google.maps.Map */(null));
    const [availableRoutes, setAvailableRoutes] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState({});
    const [isRouteSelected, setIsRouteSelected] = useState(false);
    const router = useRouter();
    const [cookies, removeCookie] = useCookies();
    const [address, setAddress] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [typeOfGoods,setTypeOfGoods] = useState("");
    const [destiantionContactNumber,setDestiantionContactNumber] = useState("");
    const [capacityOfGoods, setCapacityOfGoods] = useState(0); 
    const { notifications, sendNotification } = useContext(SocketContext);
    const { isOpen: assignVehicleModalIsOpen, onOpen: assignVehicleModalOnOpen, onClose: assignVehicleModalOnClose } = useDisclosure();
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process?.env?.NEXT_PUBLIC_API_KEY,
        libraries: ['places'],
    })
    const center = { lat: 48.8584, lng: 2.2945 }
    const lorryLogo = 'https://res.cloudinary.com/dryeiaocv/image/upload/v1732651866/lorry_kq6btk.png';

    /** @type React.MutableRefObject<HTMLInputElement> */
    const originRef = useRef()
    /** @type React.MutableRefObject<HTMLInputElement> */
    const destiantionRef = useRef()
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    getAddressFromCoords(position.coords.latitude,position.coords.longitude);
                },
                (error) => console.error("Error getting location:", error)
            );
        }
    }, []);

    useEffect(() => {
        if (notifications.length > 0) {
           
            const notification = notifications[notifications.length - 1];
            if(notification.message.includes('Your goods have delivered successfully')){
                setCurrentLocation(null);
                setSearched(false);
                setDirectionsResponse(null);
            }
            if(notification.message.includes('|')){
                const routeID = notification.message.split('|')[1];
                getRouteById(routeID);
            }
        }
    }, [notifications]);
    async function calculateRoute(origin, destiantion, waypoints) {
        // if (originRef.current.value === '' || destiantionRef.current.value === '') {
        //     return
        // }
        // eslint-disable-next-line no-undef
        const directionsService = new google.maps.DirectionsService()
        const results = await directionsService.route({
            origin: origin,
            destination: destiantion,
            waypoints: waypoints,
            // eslint-disable-next-line no-undef,
            travelMode: google.maps.TravelMode.DRIVING,
        })
        setCurrentLocation(selectedRoute.currentLocation);
        setDirectionsResponse(results)

    }

    const onClickRoute = (route) => {
        console.log(route);
        const waypoints = route.waypoints.map((point) => {
            return { location: point }
        });
        setSelectedRoute(route);
        setIsRouteSelected(true);
        calculateRoute(route.origin, route.destination, waypoints);
        assignVehicleModalOnOpen();

    }


    const findAvailableRoutes = async () => {
        setSearching(true);
        setSearched(false);
        try {
            const response = await api.post('/direction/nearbydirections', { currentLatitude: currentLocation.lat, currentLongitude: currentLocation.lng });
            if (response) {
                setSearching(false);
                if (response.data.nearbyRoute.length > 0) {
                    setAvailableRoutes(response.data.nearbyRoute);
                    setSearched(true);
                } else {
                    setAvailableRoutes([]);
                    toast.error('No available routes near you!');
                }
                console.log('RESULT::', response.data);

            }

        } catch (err) {
            console.error("Login failed:", err);
            toast.error(err.response.data.message);
            console.error("Login failed:", err);
        }
    }

    const handleLogout = () => {
        removeCookie('auth-token', { path: '/', domain: 'localhost' });
        router.push('/login');
    };

    const makeCustomerRequest = async () => {
        const token = cookies['auth-token'];
        const decodedUserData = jwt.decode(token);
        if(toAddress == '' ){
            toast.error('To address is required!');
            return;
        }
        if(capacityOfGoods == 0 ){
            toast.error('Capacity of goods is required!');
            return;
        }
        try {
            const data = {
                customerLocation: address,
                vehicle: selectedRoute.vehicle._id,
                requestedBy: decodedUserData.userId,
                requestedTo: selectedRoute.vehicle.driver,
                route: selectedRoute._id,
                toAddress: toAddress,
                capacityOfGoods: capacityOfGoods,
                typeOfGoods: typeOfGoods,
                destinationContactNumber : destiantionContactNumber

            }
            const response = await api.post('/customerrequest/create', data);
            if(response){
                toast.success('Request sent successfully!');
                assignVehicleModalOnClose();
                sendNotification(selectedRoute.vehicle.driver, `You have a new customer request!`);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message);
            console.error("Login failed:", err);
        }
    }

    const getAddressFromCoords = async (lat, lng) => {
       
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process?.env?.NEXT_PUBLIC_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK") {
                const formattedAddress = data.results[0].formatted_address;
                setAddress(formattedAddress);
                
            } else {
                console.error("Geocoding error:", data.status);
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    const getRouteById = async (routeID) => {
        try {
            const response = await api.get(`direction/getdirection/${routeID}`);
            if (response) {
                const route = response.data.data;
                setSelectedRoute(route);
                setIsRouteSelected(true);
                const waypoints = route.waypoints.map((point) => {
                    return { location: point }
                });
                calculateRoute(route.origin, route.destination, waypoints);
                setCurrentLocation(route.currentLocation);
            }
        } catch (err) {
            console.error("Error getting route:", err);
            toast.error(err?.response?.data?.message);
        }
    }

    const SelectedRouteDetailsModalBody = () => (

        <Card maxW="md"  borderRadius="lg" overflow="scroll" overflowX="unset" minHeight={"300px"} maxHeight={"300px"}>
        <CardBody>
            <List spacing={3}>
                {/* Input fields for Capacity of Goods, From Address, and To Address */}
                <ListItem>
                    <FormControl>
                        <FormLabel>Capacity of Goods ( ㎥ )</FormLabel>
                        <Input value={capacityOfGoods} onChange={(e)=> setCapacityOfGoods(e.target.value)} placeholder="Enter capacity of goods" type="number" />
                    </FormControl>
                </ListItem>

                <ListItem>
                    <FormControl>
                        <FormLabel>Type of Goods</FormLabel>
                        <Input value={typeOfGoods} onChange={(e)=> setTypeOfGoods(e.target.value)}  placeholder="Enter Goods type"  />
                    </FormControl>
                </ListItem>

                <ListItem>
                    <FormControl>
                        <FormLabel>To Address</FormLabel>
                        <Input value={toAddress} onChange={(e)=> setToAddress(e.target.value)} placeholder="Enter to address" />
                    </FormControl>
                </ListItem>
                <ListItem>
                    <FormControl>
                        <FormLabel>Destination Contact Number</FormLabel>
                        <Input value={destiantionContactNumber} onChange={(e)=> setDestiantionContactNumber(e.target.value)} placeholder="Enter Contact Number" />
                    </FormControl>
                </ListItem>
                <ListItem>
                    <Flex align="center">
                        <ListIcon as={FaMapMarkerAlt} color="teal.500" />
                        <Text fontWeight="bold">Start:</Text>
                        <Text ml={2}>{selectedRoute.origin}</Text>
                    </Flex>
                </ListItem>

                <ListItem>
                    <Flex align="center">
                        <ListIcon as={FaFlagCheckered} color="teal.500" />
                        <Text fontWeight="bold">End:</Text>
                        <Text ml={2}>{selectedRoute.destination}</Text>
                    </Flex>
                </ListItem>

                <ListItem>
                    <Flex align="center">
                        <ListIcon as={FaCalendarAlt} color="teal.500" />
                        <Text fontWeight="bold">Start Date:</Text>
                        <Text ml={2}>{selectedRoute.startDate}</Text>
                    </Flex>
                </ListItem>

                <ListItem>
                    <Flex align="center">
                        <ListIcon as={FaClock} color="teal.500" />
                        <Text fontWeight="bold">Start Time:</Text>
                        <Text ml={2}>{selectedRoute.startTime}</Text>
                    </Flex>
                </ListItem>

                <ListItem>
                    <Flex align="center">
                        <ListIcon as={FaCar} color="teal.500" />
                        <Text fontWeight="bold">Vehicle No:</Text>
                        <Text ml={2}>{selectedRoute.vehicle?.licensePlateNumber}</Text>
                    </Flex>
                </ListItem>

                <ListItem>
                    <Flex align="center">
                        <ListIcon as={FaTruck} color="teal.500" />
                        <Text fontWeight="bold">Vehicle Capacity:</Text>
                        <Text ml={2}>{selectedRoute.vehicle?.containerCapacity} ㎥</Text>
                    </Flex>
                </ListItem>

                <ListItem>
                    <Flex align="center">
                        <ListIcon as={FaRoad} color="teal.500" />
                        <Text fontWeight="bold">Vehicle On The Way:</Text>
                        <Text ml={2} color={selectedRoute.onTheWay ? 'green.500' : 'red.500'}>
                            {selectedRoute.onTheWay ? 'Yes' : 'No'}
                        </Text>
                    </Flex>
                </ListItem>
                <ListItem>
                    <Flex align="start">
                        <ListIcon as={FaMapPin} color="teal.500" />
                        <Box>
                            <Text fontWeight="bold">Waypoints:</Text>
                            <OrderedList pl={4} mt={2}>
                                {selectedRoute?.waypoints?.map((point, index) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </OrderedList>
                        </Box>
                    </Flex>
                </ListItem>
                
            </List>
        </CardBody>
    </Card>
    )

    return (
        <div>
            <Button
                colorScheme="teal"
                size="sm"
                position={'absolute'}
                top={3}
                left={3}
                zIndex={5}
                onClick={handleLogout}
            >
                Logout
            </Button>
            {isLoaded ? (
                <Flex
                    position='relative'
                    flexDirection='column'
                    alignItems='center'
                    h='100vh'
                    w='100vw'
                >
                    {searched &&
                        <Card bg={cardBg} width={'90%'} borderRadius="md" boxShadow="lg" position={'absolute'} bottom={'68px'} zIndex={3}>
                            <CardHeader>
                                <Heading display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} color={'white'} size="md">Available Lorry Routes <Box borderRadius={'50%'} width={5} height={5} backgroundColor={'#91F177'} marginLeft={5}></Box></Heading>
                            </CardHeader>
                            <CardBody>
                                <List spacing={3}>
                                    {availableRoutes.map((route, index) => (
                                        <ListItem display={'flex'} justifyContent={'space-between'} color={'whiteAlpha.900'}>{`${index + 1}. ${route.origin} to ${route.destination}`}<Button fontSize={10} paddingLeft={5} paddingRight={5} onClick={() => onClickRoute(route)} color={'white'} backgroundColor={'#EA4335'} size={'xs'} >See Direction</Button></ListItem>
                                    ))}
                                </List>
                            </CardBody>
                            <CardFooter>
                                <Text fontSize="sm" color="gray.400">
                                    Search again for find new routes
                                </Text>
                            </CardFooter>
                        </Card>
                    }
                    <Button onClick={() => findAvailableRoutes()} loading={true} loadingText="Searching..." borderRadius={20} _hover={{ backgroundColor: '#2C7A7B' }} color={'white'} position={'absolute'} zIndex={2} backgroundColor={'#0D9488'} variant="solid" bottom={5}>
                        <FaSearch color="white" style={{ marginRight: '5px' }} size={20} /> Search a Lorry
                    </Button>
                    <Box left={0} top={0} h='100%' w='100%'>
                        {/* Google Map Box */}
                        <GoogleMap
                            center={currentLocation}
                            zoom={15}
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            options={{
                                zoomControl: false,
                                streetViewControl: false,
                                mapTypeControl: false,
                                fullscreenControl: false,
                            }}
                            onLoad={map => setMap(map)}
                        >
                            <Marker icon={isRouteSelected && lorryLogo} position={isRouteSelected ? selectedRoute.currentLocation : currentLocation} label={{ text: isRouteSelected && selectedRoute.lorryRegNumber, className: 'marker-label' }} />
                            {directionsResponse && (
                                <DirectionsRenderer directions={directionsResponse} />
                            )}
                        </GoogleMap>
                    </Box>
                    <ModalComponent body={SelectedRouteDetailsModalBody()} isOpen={assignVehicleModalIsOpen} onClose={assignVehicleModalOnClose} actionButtonFunction={makeCustomerRequest} actionButtonLabel="Request to driver" title="Route Details" />
                    {searching && <Loader2 />}
                </Flex>
            ) : (
                <Loader />
            )}
        </div>


    );
};

export default Page;