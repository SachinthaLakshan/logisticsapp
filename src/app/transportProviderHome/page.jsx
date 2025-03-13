'use client'
import { Box, Button, Flex, IconButton, Input, Tooltip, useDisclosure } from "@chakra-ui/react";
import {
    useJsApiLoader,
    GoogleMap,
    Marker,
    DirectionsRenderer
} from '@react-google-maps/api'
import { useContext, useEffect, useState } from "react";
import Loader from "../components/loader/loader";
import { FaEye, FaThumbsUp, FaThumbsDown, FaWindowClose, FaBan, FaUsers, FaCheck, FaEdit, FaUserCheck } from "react-icons/fa";
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
    const [acceptedCustomersPopUpOpened, setAcceptedCustomersPopUpOpened] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [capacity, setCapacity] = useState(0);
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
    const [acceptedCustomerRequests,setAcceptedCustomerRequests] = useState([]);

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
    }, [notifications]);

    useEffect(() => {
        if (Object.keys(user).length > 0) { // Check if user is not empty
            findAvailableRoutes();
        }
    }, [user]);

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
                    setCapacity(response.data.data.vehicleDetails.containerCapacity);
                  
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
                        setAvailableRoute(response.data.data);
                        if (response.data.data.driverConfirmed) {
                            setTripAccepted(true);
                            setTripStarted(true);
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

    const featchCustomerRequests = async (feated) => {
        const token = cookies['auth-token'];

        const decodedUserData = jwt.decode(token);
        try {
            setIsLoading(true);
            const response = await api.get(`customerrequest/getcustomerrequests/${decodedUserData.userId}`);
            if (response) {
                if (response.data) {
                    if(response.data.length === 0){
                    setIsLoading(false);
                    setCustomerPopUpOpened(false);
                       return feated && toast.error('No Requests Found');
                    }
                    setCustomerRequests(response.data);
                    setCustomerPopUpOpened(!customerPopUpOpened);
                    setAcceptedCustomersPopUpOpened(false);
                    setIsLoading(false);
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    const featchAccptedCustomerRequests = async (feated) => {
        const token = cookies['auth-token'];

        const decodedUserData = jwt.decode(token);
        setIsLoading(true);
        try {
            const response = await api.get(`customerrequest/getacceptedcustomerrequests/${decodedUserData.userId}`);
            if (response) {
                if (response.data) {
                    if(response.data.length === 0){
                        setIsLoading(false);
                        setAcceptedCustomersPopUpOpened(false);
                       return feated && toast.error('No Accepted Requests Found');
                    }
                    setAcceptedCustomerRequests(response.data);
                    setAcceptedCustomersPopUpOpened(!acceptedCustomersPopUpOpened);
                    setCustomerPopUpOpened(false);
                    setIsLoading(false);
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
                    featchCustomerRequests(false);
                    setCustomerPopUpOpened(false);
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    const acceptCustomerRequest = async (req) => {
        try {
            const response = await api.put(`customerrequest/accept/${req._id}/${req.route._id}`, { address: req.customerLocation }, { address: req.customerLocation });
            if (response) {
                if (response.data) {
                    toast.success(response.data.message);
                    featchCustomerRequests( false);
                    setCustomerPopUpOpened(false);
                    sendNotification(req.requestedBy._id, `${user.vehicleDetails.licensePlateNumber} :Vehicle has accepted your request|${req.route._id}`);
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

    const handleUpdateClick = async () => {
        // Here you can add the logic to update the capacity value in your backend or state management
        setIsEditing(false);
        try {
            const response = await api.put(`direction/updatecapacity/${user?.vehicleDetails?.licensePlateNumber}/${capacity}`);
            if (response) {
                if (response.data) {
                    toast.success(response.data.message);
                }
            }
        } catch (error) {
            console.error("error", error);
        }

    };

    const handleAcceptedCustomerRequests = () => {
        featchAccptedCustomerRequests(true);
    }

    const handleCustomerRequests = () => {
        featchCustomerRequests(true);
    }

    const onDeliveredOrder = async (request) => {
        try {
            const response = await api.delete(`customerrequest/delivered/${request._id}`);
            if (response) {
                if (response.data) {
                    toast.success(response.data.message);
                    featchAccptedCustomerRequests(false);
                    sendNotification(request.requestedBy._id, `Your goods have delivered successfully`);
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    const markAsTripFinished = async () => {
        
        setIsLoading(true);
        try {
            const response = await api.put(`direction/finishtrip/${availableRoute._id}`);
            if (response) {
                if (response.data) {
                    setIsLoading(false);
                    toast.success(response.data.message);
                    onClosePopup();
                    setTripStarted(false);
                    setDirectionsResponse(null)
                    sendNotification(availableRoute.createdBy._id, `${availableRoute.vehicle.licensePlateNumber} has Finish the trip`);
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
                top={3}
                left={3}
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
                        <Flex
                            justify="center" // Center horizontally
                            position="absolute"
                            top="20px" // Distance from the top
                            left="0"
                            right="0"
                            zIndex={3}
                        >
                            <Box
                                p={4}
                                bg="rgba(5, 5, 5, 0.7)"
                                borderRadius="lg"
                                boxShadow="lg"
                                width="300px"
                                backdropFilter="blur(10px)"
                            >
                                <Flex align="center" justify="space-between">
                                    {/* Left Section: Logo and Text */}
                                    <Flex align="center" gap={3}>
                                        <Image
                                            src="lorry.png"
                                            alt="Lorry Logo"
                                            boxSize="50px"
                                            borderRadius="md"
                                        />
                                        <Box>
                                            <Text fontSize="sm" color="gray.300" fontWeight="medium">
                                                Remaining Capacity ( m³ )
                                            </Text>
                                            {isEditing ? (
                                                <Input
                                                    value={capacity}
                                                    onChange={(e) => setCapacity(e.target.value)}
                                                    size="sm"
                                                    width="80px"
                                                    color="white"
                                                    placeholder="Capacity"
                                                    _placeholder={{ color: 'gray.400' }}
                                                    focusBorderColor="green.400"
                                                    autoFocus
                                                />
                                            ) : (
                                                <Text fontSize="xl" textAlign="center" color="green.400" fontWeight="bold">
                                                    {capacity} m³
                                                </Text>
                                            )}
                                        </Box>
                                    </Flex>

                                    {/* Right Section: Edit/Update Button */}
                                    <Tooltip label={isEditing ? 'Update Capacity' : 'Edit Capacity'} placement="top">
                                        <IconButton
                                            aria-label={isEditing ? 'Update Capacity' : 'Edit Capacity'}
                                            icon={isEditing ? <FaCheck /> : <FaEdit />}
                                            size="sm"
                                            colorScheme={isEditing ? 'green' : 'blue'}
                                            onClick={isEditing ? handleUpdateClick : handleEditClick}
                                        />
                                    </Tooltip>
                                </Flex>
                            </Box>
                        </Flex>

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
                                        {tripAccepted && tripStarted &&
                                            <>   <Button width={200} _hover={{ backgroundColor: '#0b6a35' }} rightIcon={<FaThumbsUp />} onClick={() => markAsTripFinished()} color={'white'} backgroundColor={'green'} size="md" >Finish Trip</Button>
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
                                        <List key={index} marginBottom={2} borderRadius={10} padding={2} border={'2px solid #b9b7b7'} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} spacing={1}>
                                            <ListItem fontSize={10} color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2 ml-2">From Address : {request.customerLocation} </span> </ListItem>
                                            <ListItem fontSize={10} color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2 ml-2">To Address : {request.toAddress} </span> </ListItem>
                                            <ListItem fontSize={10} color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2 ml-2">Type of Goods : {request.requestedBy.typeOfGoods} </span> </ListItem>
                                            <ListItem fontSize={10} color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2 ml-2">Capacity of Goods : {request.capacityOfGoods} m³</span> </ListItem>
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
                    {acceptedCustomersPopUpOpened &&
                        <Card bg={cardBg} width={'90%'} borderRadius="md" boxShadow="lg" position={'absolute'} bottom={'68px'} zIndex={3}>
                            <CardHeader>
                                <Heading display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} color={'white'} size="md"> Accepted Customer Requests <FaWindowClose onClick={() => setAcceptedCustomersPopUpOpened(false)} style={{ marginLeft: '30px' }} /> </Heading>
                            </CardHeader>
                            <CardBody >
                                {
                                    acceptedCustomerRequests.length > 0 && acceptedCustomerRequests.map((request, index) => (
                                        <List key={index} marginBottom={2} borderRadius={10} padding={2} border={'2px solid #b9b7b7'} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} spacing={1}>
                                            <ListItem fontSize={10} color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2 ml-2">From Address : {request.customerLocation} </span> </ListItem>
                                            <ListItem fontSize={10} color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2 ml-2">To Address : {request.toAddress} </span> </ListItem>
                                            <ListItem fontSize={10} color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2 ml-2">Type of Goods : {request.typeOfGoods} </span> </ListItem>
                                            <ListItem fontSize={10} color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2 ml-2">Capacity of Goods : {request.capacityOfGoods} m³</span> </ListItem>
                                            <ListItem color={'whiteAlpha.900'}><span style={{ color: '#b9b7b7 ' }} className="font-bold mr-2">Destination Contact No :</span>{request?.destinationContactNumber}</ListItem>
                                            <Box display={'flex'} flexDirection={'row'}>
                                            <Button _hover={{ backgroundColor: '#0b6a35' }} rightIcon={<FaThumbsUp />} onClick={() => onDeliveredOrder(request)} color={'white'} backgroundColor={'green'} size="md" >Delivered</Button>
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
                    <Button onClick={handleCustomerRequests} loading={true} loadingText="Searching..." borderRadius={20} _hover={{ backgroundColor: '#2C7A7B' }} color={'white'} position={'absolute'} zIndex={2} backgroundColor={'#0D9488'} variant="solid" bottom={5} left={15}>
                        <FaUsers color="white" style={{ marginRight: '5px' }} size={20} />
                    </Button>
                    <Button onClick={ handleAcceptedCustomerRequests } loading={true} loadingText="Searching..." borderRadius={20} _hover={{ backgroundColor: '#2C7A7B' }} color={'white'} position={'absolute'} zIndex={2} backgroundColor={'#0D9488'} variant="solid" bottom={5} left={'80px'}>
                        <FaUserCheck color="white" style={{ marginRight: '5px' }} size={20} />
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