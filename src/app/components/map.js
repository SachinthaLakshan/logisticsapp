'use client'
import {
    Box,
    Button,
    ButtonGroup,
    Flex,
    HStack,
    IconButton,
    Input,
    SkeletonText,
    Text,
} from '@chakra-ui/react'
import { FaLocationArrow, FaTimes } from 'react-icons/fa'

import {
    useJsApiLoader,
    GoogleMap,
    Marker,
    Autocomplete,
    DirectionsRenderer,
} from '@react-google-maps/api'
import { useRef, useState } from 'react'

const center = { lat: 48.8584, lng: 2.2945 }

function MyComponent() {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process?.env?.GOOGLE_KEY,
        libraries: ['places'],
    })

    const [map, setMap] = useState(/** @type google.maps.Map */(null))
    const [directionsResponse, setDirectionsResponse] = useState(null)
    const [distance, setDistance] = useState('')
    const [duration, setDuration] = useState('')

    /** @type React.MutableRefObject<HTMLInputElement> */
    const originRef = useRef()
    /** @type React.MutableRefObject<HTMLInputElement> */
    const destiantionRef = useRef()

    if (!isLoaded) {
        return <SkeletonText />
    }

    async function calculateRoute() {
        if (originRef.current.value === '' || destiantionRef.current.value === '') {
            return
        }
        // eslint-disable-next-line no-undef
        const directionsService = new google.maps.DirectionsService()
        const results = await directionsService.route({
            origin: originRef.current.value,
            destination: destiantionRef.current.value,
            // eslint-disable-next-line no-undef
            travelMode: google.maps.TravelMode.DRIVING,
        })
        console.log(results);


        // Extract route points
        const route = results.routes[0].legs[0].steps.map(step => {
            return step.start_location; // You can also use step.end_location
        });

        // Check proximity for a specific location (e.g., origin)
        const locationToCheck = { lat: 7.228802,  lng: 80.200791 };

        const isClose = route.some(point => {
            console.log('>>>:',haversineDistance(locationToCheck, point));
            
            return haversineDistance(locationToCheck, point) < 0.5; // Check if within 500m
        });

        console.log(isClose ? "Location is close to the route" : "Location is not close to the route");
    

    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
}

function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destiantionRef.current.value = ''
}


const haversineDistance = (coords1, coords2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
    const dLon = (coords2.lng - coords1.lng) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coords1.lat * (Math.PI / 180)) * Math.cos(coords2.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
};

return (
    <Flex
        position='relative'
        flexDirection='column'
        alignItems='center'
        h='100vh'
        w='100vw'
    >
        <Box position='absolute' left={0} top={0} h='100%' w='100%'>
            {/* Google Map Box */}
            <GoogleMap
                center={center}
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
                <Marker position={center} />
                {directionsResponse && (
                    <DirectionsRenderer directions={directionsResponse} />
                )}
            </GoogleMap>
        </Box>
        <Box
            p={4}
            borderRadius='lg'
            m={4}
            bgColor='white'
            shadow='base'
            minW='container.md'
            zIndex='1'
        >
            <HStack spacing={2} justifyContent='space-between'>
                <Box flexGrow={1}>
                    <Autocomplete>
                        <Input type='text' placeholder='Origin' ref={originRef} />
                    </Autocomplete>
                </Box>
                <Box flexGrow={1}>
                    <Autocomplete>
                        <Input
                            type='text'
                            placeholder='Destination'
                            ref={destiantionRef}
                        />
                    </Autocomplete>
                </Box>

                <ButtonGroup>
                    <Button colorScheme='pink' type='submit' onClick={calculateRoute}>
                        Calculate Route
                    </Button>
                    <IconButton
                        aria-label='center back'
                        icon={<FaTimes />}
                        onClick={clearRoute}
                    />
                </ButtonGroup>
            </HStack>
            <HStack spacing={4} mt={4} justifyContent='space-between'>
                <Text>Distance: {distance} </Text>
                <Text>Duration: {duration} </Text>
                <IconButton
                    aria-label='center back'
                    icon={<FaLocationArrow />}
                    isRound
                    onClick={() => {
                        map.panTo(center)
                        map.setZoom(15)
                    }}
                />
            </HStack>
        </Box>
    </Flex>
)
  }

export default MyComponent