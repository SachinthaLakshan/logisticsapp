'use client';

import { Box, Flex, Icon, Text, IconButton } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaFlagCheckered, FaArrowLeft } from 'react-icons/fa';
import { useRouter,useParams } from 'next/navigation';
import {
    useJsApiLoader,
    GoogleMap,
    Marker,
    DirectionsRenderer
} from '@react-google-maps/api'
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../lib/axios';
import Loader from '../components/loader/loader';
const lorryLogo = 'https://res.cloudinary.com/dryeiaocv/image/upload/v1732651866/lorry_kq6btk.png';

const RouteMap = () => {
    const router = useRouter();
    const params = useParams();
    const [currentLocation, setCurrentLocation] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [map, setMap] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process?.env?.NEXT_PUBLIC_API_KEY,
        libraries: ['places'],
    });

    useEffect(() => {
        console.log('routeId',params.routeId);
        if (!params.routeId) {
            console.log('no routeId');
            return;
        }else{
            console.log('routeId',params.routeId);
            getRouteById(params.routeId);
        }
    }, [params.routeId]);

    const getRouteById = async (routeID) => {
        try {
            const response = await api.get(`direction/getdirection/${routeID}`);
            if (response) {
                const route = response.data.data;
                const waypoints = route.waypoints.map((point) => {
                    return { location: point }
                });
                calculateRoute(route.origin, route.destination, waypoints,route);
                setCurrentLocation(route.currentLocation);
                setIsLoading(false)
            }
        } catch (err) {
            console.error("Error getting route:", err);
            toast.error(err?.response?.data?.message);
        }
    }

    async function calculateRoute(origin, destiantion, waypoints,selectedRoute) {
    
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

    return (
        <Flex direction="column" h="100vh" w="full">
            {/* Top Section with Back Button */}
            <Box bg="white" p={6} shadow="md" zIndex={1}>
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align="center"
                    maxW="6xl"
                    mx="auto"
                    gap={4}
                >
                    <IconButton
                        aria-label="Go back"
                        icon={<FaArrowLeft />}
                        onClick={() => router.back()}
                        variant="ghost"
                        colorScheme="blue"
                        size="sm"
                        mr={{ base: 0, md: 4 }}
                        mb={{ base: 4, md: 0 }}
                    />

                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        flex="1"
                        gap={4}
                    >
                        <Flex align="center" gap={3}>
                            <Icon as={FaMapMarkerAlt} color="green.500" boxSize={6} />
                            <Box>
                                <Text fontWeight="bold" color="gray.700">Origin</Text>
                                <Text color="gray.500">San Francisco, CA 94105</Text>
                            </Box>
                        </Flex>

                        <Flex align="center" gap={3}>
                            <Icon as={FaFlagCheckered} color="red.500" boxSize={6} />
                            <Box>
                                <Text fontWeight="bold" color="gray.700">Destination</Text>
                                <Text color="gray.500">New York, NY 10007</Text>
                            </Box>
                        </Flex>
                    </Flex>
                </Flex>
            </Box>

            {/* Map Section */}
            <Box flex="1" position="relative" minH="400px">
                <Box left={0} top={0} h='100%' w='100%'>
                    {/* Google Map Box */}
                    {isLoaded && !isLoading? <GoogleMap
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
                    </GoogleMap>:<Loader />}
                </Box>
            </Box>
        </Flex>
    );
};

export default RouteMap;