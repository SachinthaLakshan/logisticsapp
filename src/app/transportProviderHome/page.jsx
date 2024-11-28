'use client'
import { Box, Button, Flex } from "@chakra-ui/react";
import {
    useJsApiLoader,
    GoogleMap,
    Marker,
    DirectionsRenderer,
} from '@react-google-maps/api'
import { useEffect, useState } from "react";
import Loader from "../components/loader/loader";
import { FaEye, FaThumbsUp, FaThumbsDown, FaWindowClose, FaBan } from "react-icons/fa";
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

const Page = () => {
    const cardBg = useColorModeValue('#3A3D42', '#2F3136');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [map, setMap] = useState(/** @type google.maps.Map */(null));
    const [availableRoute, setAvailableRoute] = useState({});
    const [searching, setSearching] = useState(false);
    const [tripAccepted, setTripAccepted] = useState(false);
    const [bottomPopUpOpened, setBottomPopUpOpened] = useState(false);
    const [user, setUser] = useState({});
    const [cookies] = useCookies(['auth-token']);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process?.env?.NEXT_PUBLIC_API_KEY,
        libraries: ['places'],
    })
    const center = { lat: 48.8584, lng: 2.2945 }
    const lorryLogo = 'https://res.cloudinary.com/dryeiaocv/image/upload/v1732651866/lorry_kq6btk.png';

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

    const getLogedUser = async () => {
        const token = cookies['auth-token'];

        const decodedUserData = jwt.decode(token);

        try {
            const response = await api.get(`user/getuser/${decodedUserData.userId}`);
            if (response) {
                if (response.data) {
                    setUser(response.data.data)
                }
            }
        } catch (error) {
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
                    toast.success(response.data.message);
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
                }
            }
        } catch (error) {
            console.error("error", error);
        }

    }


    const findAvailableRoutes = async () => {
        if (tripAccepted) {
            setBottomPopUpOpened(true);
        } else {
            try {
                const response = await api.get(`direction/findtrip/${user.vehicleDetails}`);
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
                        setBottomPopUpOpened(true);
                    } else {
                        toast.error(response.data.message);
                    }
                }
            } catch (err) {
                console.error("Login failed:", err);
            }
        }

    }

    const onClosePopup = () => {
        setBottomPopUpOpened(!bottomPopUpOpened);
    }
    return (
        <div>
            {isLoaded ? (
                <Flex
                    position='relative'
                    flexDirection='column'
                    alignItems='center'
                    h='100vh'
                    w='100vw'
                >{tripAccepted &&
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
                                    <strong>{availableRoute.vehicle.containerCapacity}%</strong>
                                </Text>
                            </Box>
                        </Grid>
                    </Box>

                    }
                    {bottomPopUpOpened &&
                        <Card bg={cardBg} width={'90%'} borderRadius="md" boxShadow="lg" position={'absolute'} bottom={'68px'} zIndex={3}>
                            <CardHeader>
                                <Heading display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} color={'white'} size="md">Assigned Trip Details <FaWindowClose onClick={() => onClosePopup()} style={{ marginLeft: '30px' }} /> </Heading>
                            </CardHeader>
                            <CardBody>
                                <List display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} spacing={2}>
                                    <ListItem color={'whiteAlpha.900'}>{` ${availableRoute.origin}  to  ${availableRoute.destination}`}</ListItem>
                                    <Box display={'flex'} flexDirection={'row'}>
                                        {!tripAccepted && <>
                                            <Button _hover={{ backgroundColor: '#0b6a35' }} rightIcon={<FaThumbsUp />} onClick={() => onStartTrip()} color={'white'} backgroundColor={'green'} size="md" >Start Trip</Button>
                                            <Button _hover={{ backgroundColor: '#b90420' }} marginLeft={5} rightIcon={<FaThumbsDown />} color={'white'} backgroundColor={'red'} size="md" >Ignore Trip</Button>
                                        </>
                                        }
                                        {tripAccepted && <Button _hover={{ backgroundColor: '#b90420' }} marginLeft={5} rightIcon={<FaBan />} onClick={() => onCancelTrip()} color={'white'} backgroundColor={'red'} size="lg" >Cansel Trip</Button>}

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
                    <Button onClick={() => findAvailableRoutes()} loading={true} loadingText="Searching..." borderRadius={20} _hover={{ backgroundColor: '#2C7A7B' }} color={'white'} position={'absolute'} zIndex={2} backgroundColor={'#0D9488'} variant="solid" bottom={5}>
                        <FaEye color="white" style={{ marginRight: '5px' }} size={20} /> My Trips
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