'use client'
import { Box, Button, Flex, useDisclosure } from "@chakra-ui/react";
import {
    useJsApiLoader,
    GoogleMap,
    Marker,
    DirectionsRenderer
} from '@react-google-maps/api'
import { useContext, useEffect, useState } from "react";
import Loader from "../components/loader/loader";
import { FaEye, FaThumbsUp, FaThumbsDown, FaWindowClose, FaBan, FaUsers } from "react-icons/fa";
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
    Image,
    Grid,
} from '@chakra-ui/react';
import api from "../lib/axios";
import { toast } from "react-toastify";
import Loader2 from "../components/loader/loader2";
import { useCookies } from "react-cookie";
import jwt from 'jsonwebtoken';
import { useRouter } from "next/navigation";
import { SocketContext } from "../lib/socketContext";

const Page = () => {
    const cardBg = useColorModeValue('#3A3D42', '#2F3136');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [map, setMap] = useState(/** @type google.maps.Map */(null));
    const [availableRoute, setAvailableRoute] = useState({});
    const [searching, setSearching] = useState(false);
    const [tripAccepted, setTripAccepted] = useState(false);
    const [tripStarted, setTripStarted] = useState(false);
    const [bottomPopUpOpened, setBottomPopUpOpened] = useState(false);
    const [user, setUser] = useState({});
    const [cookies] = useCookies(['auth-token']);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process?.env?.NEXT_PUBLIC_API_KEY,
        libraries: ['places'],
    });
    const router = useRouter();
    const [cookie, setCookie, removeCookie] = useCookies();
    const center = { lat: 48.8584, lng: 2.2945 }
    const lorryLogo = 'https://res.cloudinary.com/dryeiaocv/image/upload/v1732651866/lorry_kq6btk.png';
    const { notifications, sendNotification } = useContext(SocketContext);
    const [isLoading, setIsLoading] = useState(true);
    const [customerPopUpOpened, setCustomerPopUpOpened] = useState(false);
    const [customerRequests, setCustomerRequests] = useState([]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => console.error("Error getting location:", error)
            );
        }
        getLogedUser();

    }, []);

    useEffect(() => {
        if (!isLoading) {
            findAvailableRoutes();
        }
    }, [notifications])

    const getLogedUser = async () => {
        setIsLoading(true);
        const token = cookies['auth-token'];

        const decodedUserData = jwt.decode(token);

        try {
            const response = await api.get(`user/getuser/${decodedUserData.userId}`);
            if (response) {
                if (response.data) {
                    setIsLoading(false);
                    setUser(response.data.data);
                    featchCustomerRequests();
                }
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    }
    async function calculateRoute(origin, destiantion, waypoints) {

        // eslint-disable-next-line no-undef
        const directionsService = new google.maps.DirectionsService()
        const results = await directionsService.route({
            origin: origin,
            destination: destiantion,
            waypoints: waypoints,
            // eslint-disable-next-line no-undef,
            travelMode: google.maps.TravelMode.DRIVING,
        })

        setDirectionsResponse(results)

    }

    const onStartTrip = async () => {
        try {
            const response = await api.put(`direction/driverresponse/${availableRoute._id}/true`);
            if (response) {
                if (response.data) {
                    const waypoints = availableRoute.waypoints.map((point) => {
                        return { location: point }
                    });
                    calculateRoute(currentLocation, availableRoute.destination, waypoints);
                    setTripAccepted(true);
                    setBottomPopUpOpened(false);
                    updateDriverCurrentLocation();
                    toast.success(response.data.message);
                    sendNotification(availableRoute.createdBy._id, `${availableRoute.vehicle.licensePlateNumber} has accepted the trip`);
                }
            }
        } catch (error) {
            console.error("error", error);
        }

    }

    const onCancelTrip = async () => {
        try {
            const response = await api.put(`direction/driverresponse/${availableRoute._id}/false`);
            if (response) {
                if (response.data) {
                    setTripAccepted(false);
                    setBottomPopUpOpened(true);
                    toast.success(response.data.message);
                    sendNotification(availableRoute.createdBy._id, `${availableRoute.vehicle.licensePlateNumber} has Cancel the trip`);
                }
            }
        } catch (error) {
            console.error("error", error);
        }

    }


    const findAvailableRoutes = async () => {
        if (tripAccepted) {
            setBottomPopUpOpened(true);
            updateDriverCurrentLocation();
        } else {
            try {
                const response = await api.get(`direction/findtrip/${user.vehicleDetails._id}`);
                if (response) {
                    setSearching(false);
                    if (response.data) {
                        console.log(response);
                        setAvailableRoute(response.data.data);
                        if (response.data.data.driverConfirmed) {
                            setTripAccepted(true);
                            const waypoints = response.data.data.waypoints.map((point) => {
                                return { location: point }
                            });
                            calculateRoute(currentLocation, response.data.data.destination, waypoints);
                        }
                        if (response.data.data.onTheWay) {
                            setTripStarted(true);
                        }
                        setBottomPopUpOpened(true);
                        updateDriverCurrentLocation();
                    } else {
                        toast.error(response.data.message);
                    }
                }
            } catch (error) {
                console.log("Route failed:", error);
                toast.error(error.response.data.message);
            }
        }

    }

    const onClosePopup = () => {
        setBottomPopUpOpened(!bottomPopUpOpened);
    }

    const updateDriverCurrentLocation = async () => {
        try {
            await api.put(`direction/updatecurrentlocation`, { directionId: availableRoute._id, lat: currentLocation.lat, lng: currentLocation.lng });
        } catch (err) {
            console.log("Error:", err);
        }
    }
    const handleLogout = () => {
        removeCookie('auth-token', { path: '/', domain: 'localhost' });
        router.push('/login');
    };

    const onRemoveTrip = async () => {

        setSearching(true);
        try {
            const response = await api.delete(`direction/ignore/${availableRoute._id}`);
            if (response) {
                if (response.data) {
                    setSearching(false);
                    toast.success(response.data.message);
                    onClosePopup();
                    sendNotification(availableRoute.createdBy._id, `${availableRoute.vehicle.licensePlateNumber} has Ignore the trip`);
                }
            }
        } catch (error) {
            console.error("error", error);
        }

    }

    const onConfirmStartTrip = async () => {
        setSearching(true);
        try {
            const response = await api.put(`direction/starttrip/${availableRoute._id}`);
            if (response) {
                if (response.data) {
                    setSearching(false);
                    toast.success(response.data.message);
                    onClosePopup();
                    setTripStarted(true);
                    sendNotification(availableRoute.createdBy._id, `${availableRoute.vehicle.licensePlateNumber} has Start the trip and on the way`);
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    const onCustomerPopUpOpened = () => {
        setCustomerPopUpOpened(!customerPopUpOpened);
    }

    const featchCustomerRequests = async () => {
        const token = cookies['auth-token'];

        const decodedUserData = jwt.decode(token);
        try {
            const response = await api.get(`customerrequest/getcustomerrequests/${decodedUserData.userId}`);
            if (response) {
                if (response.data) {
                    setCustomerRequests(response.data);
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    const removeCustomerRequest = async (id) => {
        try {
            const response = await api.delete(`customerrequest/delete/${id}`);
            if (response) {
                if (response.data) {
                    toast.success(response.data.message);
                    featchCustomerRequests();
                    setCustomerPopUpOpened(false);
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    const acceptCustomerRequest = async (req) => {
        try {
            const response = await api.put(`customerrequest/accept/${req._id}/${req.route._id}`,{address:req.customerLocation},{address:req.customerLocation });
            if (response) {
                if (response.data) {
                    toast.success(response.data.message);
                    featchCustomerRequests();
                    setCustomerPopUpOpened(false);
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    return (
        <div>
            <Button

                colorScheme="teal"
                size="sm"
                position={'absolute'}
                top={0}
                left={0}
                zIndex={5}
                onClick={handleLogout}
            >
                Logout
            </Button>
            {isLoaded && !isLoading ? (
                <Flex
                    position='relative'
                    flexDirection='column'
                    alignItems='center'
                    h='100vh'
                    w='100vw'
                >{
                        <Box
                            p={5}
                            bg="rgb(5, 5, 5,0.5)"
                            borderRadius="20px"
                            boxShadow="lg"
                            textAlign="left"
                            width="250px"
                            position={'absolute'}
                            top={'10px'}
                            zIndex={3}
                            padding={4}
                        >
                            <Grid templateColumns="1fr auto" alignItems="center">
                                <Image
                                    src="lorry.png"
                                    alt="Lorry Logo"
                                    boxSize="50px"
                                />
                                <Box>
                                    <Text fontSize="medium" color="white">
                                        Remaining Capacity
                                    </Text>
                                    <Text fontSize="xl" color="green.400">
                                        <strong>{user?.vehicleDetails?.containerCapacity}%</strong>
                                    </Text>
                                </Box>
                            </Grid>
                        </Box>

                    }
                    {bottomPopUpOpened &&
                        <Card bg={cardBg} width={'90%'} borderRadius="md" boxShadow="lg" position={'absolute'} bottom={'68px'} zIndex={3}>
                            <CardHeader>
                                <Heading display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} color={'white'} size="md">{tripAccepted ? 'Accepted' : 'Assigned'} Trip Details <FaWindowClose onClick={() => onClosePopup()} style={{ marginLeft: '30px' }} /> </Heading>
                            </CardHeader>
                            <CardBody>
                                <List display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} spacing={2}>
                                    <ListItem color={'whiteAlpha.900'}>{availableRoute.origin} <span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2 ml-2">To </span> {availableRoute.destination}</ListItem>
                                    <ListItem color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2">Start At :</span>{` ${availableRoute.startDate} | ${availableRoute.startTime}`}</ListItem>
                                    <ListItem className="mb-2" color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2">Company : </span>{`${availableRoute?.createdBy?.fullName}`}</ListItem>
                                    <Box display={'flex'} flexDirection={'row'}>
                                        {!tripAccepted && <>
                                            <Button _hover={{ backgroundColor: '#0b6a35' }} rightIcon={<FaThumbsUp />} onClick={() => onStartTrip()} color={'white'} backgroundColor={'green'} size="md" >Accept Trip</Button>
                                            <Button _hover={{ backgroundColor: '#b90420' }} marginLeft={5} rightIcon={<FaThumbsDown />} onClick={() => onRemoveTrip()} color={'white'} backgroundColor={'red'} size="md" >Ignore Trip</Button>
                                        </>
                                        }
                                        {tripAccepted && !tripStarted &&
                                            <>   <Button _hover={{ backgroundColor: '#0b6a35' }} rightIcon={<FaThumbsUp />} onClick={() => onConfirmStartTrip()} color={'white'} backgroundColor={'green'} size="md" >Start</Button>
                                                <Button _hover={{ backgroundColor: '#b90420' }} marginLeft={5} rightIcon={<FaBan />} onClick={() => onCancelTrip()} color={'white'} backgroundColor={'red'} size="md" >Cansel</Button>
                                            </>
                                        }

                                    </Box>

                                </List>
                            </CardBody>
                            {!tripAccepted &&
                                <CardFooter>
                                    <Text fontSize="sm" color="gray.400">
                                        Search again for find new trip
                                    </Text>
                                </CardFooter>
                            }
                        </Card>
                    }
                    {customerPopUpOpened &&
                        <Card bg={cardBg} width={'90%'} borderRadius="md" boxShadow="lg" position={'absolute'} bottom={'68px'} zIndex={3}>
                            <CardHeader>
                                <Heading display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} color={'white'} size="md"> Customer Requests <FaWindowClose onClick={() => setCustomerPopUpOpened(false)} style={{ marginLeft: '30px' }} /> </Heading>
                            </CardHeader>
                            <CardBody >
                                {
                                    customerRequests.length > 0 && customerRequests.map((request, index) => (
                                        <List key={index} marginBottom={2} borderRadius={10} padding={2} border={'2px solid #b9b7b7'} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} spacing={2}>
                                            <ListItem fontSize={10} color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2 ml-2">Address : {request.customerLocation} </span> </ListItem>
                                            <ListItem color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2">Contact No :</span>{request.requestedBy.contactNumber}</ListItem>
                                            <Box display={'flex'} flexDirection={'row'}>
                                                <Button _hover={{ backgroundColor: '#0b6a35' }} rightIcon={<FaThumbsUp />} onClick={() => acceptCustomerRequest(request)} color={'white'} backgroundColor={'green'} size="md" >Accept</Button>
                                                <Button _hover={{ backgroundColor: '#b90420' }} marginLeft={5} rightIcon={<FaThumbsDown />} onClick={() => removeCustomerRequest(request._id)} color={'white'} backgroundColor={'red'} size="md" >Ignore</Button>
                                            </Box>

                                        </List>
                                    ))
                                }
                            </CardBody>
                        </Card>
                    }
                    <Button onClick={() => findAvailableRoutes()} loading={true} loadingText="Searching..." borderRadius={20} _hover={{ backgroundColor: '#2C7A7B' }} color={'white'} position={'absolute'} zIndex={2} backgroundColor={'#0D9488'} variant="solid" bottom={5}>
                        <FaEye color="white" style={{ marginRight: '5px' }} size={20} /> My Trips
                    </Button>
                    <Button onClick={() =>customerRequests.length > 0? onCustomerPopUpOpened() : toast.error( 'No Requests Found')} loading={true} loadingText="Searching..." borderRadius={20} _hover={{ backgroundColor: '#2C7A7B' }} color={'white'} position={'absolute'} zIndex={2} backgroundColor={'#0D9488'} variant="solid" bottom={5} left={15}>
                        <FaUsers color="white" style={{ marginRight: '5px' }} size={20} />
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
                            <Marker icon={lorryLogo} position={currentLocation} />
                            {directionsResponse && (
                                <DirectionsRenderer directions={directionsResponse} />
                            )}
                        </GoogleMap>
                    </Box>
                    {searching && <Loader2 />}
                </Flex>
            ) : (
                <Loader />
            )}
        </div>


    );
};
export default Page;