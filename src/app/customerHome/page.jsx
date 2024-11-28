'use client'
import { Box, Button, Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
    useJsApiLoader,
    GoogleMap,
    Marker,
    Autocomplete,
    DirectionsRenderer,
} from '@react-google-maps/api'
import { useEffect, useRef, useState } from "react";
import { BounceLoader } from "react-spinners";
import Loader from "../components/loader/loader";
import MyComponent from "../components/map";
import { FaSearch } from "react-icons/fa";
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
                },
                (error) => console.error("Error getting location:", error)
            );
        }
    }, []);
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
        const waypoints = route.waypoints.map((point)=>{
            return {location:point}
        });
        setSelectedRoute(route);  
        setIsRouteSelected(true);
        calculateRoute(route.origin, route.destination,waypoints);

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
            toast.error(err.response.data.message);
            console.error("Login failed:", err);
        }
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
                >
                    { searched &&
                        <Card bg={cardBg} width={'90%'} borderRadius="md" boxShadow="lg" position={'absolute'} bottom={'68px'} zIndex={3}>
                            <CardHeader>
                                <Heading display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} color={'white'} size="md">Available Lorry Routes <Box borderRadius={'50%'} width={5} height={5} backgroundColor={'#91F177'} marginLeft={5}></Box></Heading>
                            </CardHeader>
                            <CardBody>
                                <List spacing={3}>
                                    {availableRoutes.map((route, index) => (
                                        <ListItem  display={'flex'} justifyContent={'space-between'} color={'whiteAlpha.900'}>{`${index + 1}. ${route.origin} to ${route.destination}`}<Button onClick={()=>onClickRoute(route)} color={'white'} backgroundColor={'#EA4335'} size={'xs'} >See Directions</Button></ListItem>
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
                            <Marker  icon={isRouteSelected && lorryLogo} position={isRouteSelected ? selectedRoute.currentLocation : currentLocation} label={{text:isRouteSelected && selectedRoute.lorryRegNumber,className:'marker-label'}} />
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