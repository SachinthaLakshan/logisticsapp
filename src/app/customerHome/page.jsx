'use client'
import { Box, Button, Flex, Select } from "@chakra-ui/react";
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
const Page = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [map, setMap] = useState(/** @type google.maps.Map */(null));
    const [routes, setRoutes] = useState([{origin:'Colombo',destination:'Kurunegala'},{origin:'Colombo',destination:'Warakapola'},{origin:'Colombo',destination:'Kandy'}]);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyAdMVBhGwHwwf875ZJhX59KMkoOC66QsSU',
        libraries: ['places'],
    })
    const center = { lat: 48.8584, lng: 2.2945 }

    /** @type React.MutableRefObject<HTMLInputElement> */
    const originRef = useRef()
    /** @type React.MutableRefObject<HTMLInputElement> */
    const destiantionRef = useRef()
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('>>', position.coords.latitude);
                    console.log('>>', position.coords.longitude);
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => console.error("Error getting location:", error)
            );
        }
    }, []);
    async function calculateRoute(origin, destiantion) {
        // if (originRef.current.value === '' || destiantionRef.current.value === '') {
        //     return
        // }
        // eslint-disable-next-line no-undef
        const directionsService = new google.maps.DirectionsService()
        const results = await directionsService.route({
            origin: origin,
            destination: destiantion,
            // eslint-disable-next-line no-undef
            travelMode: google.maps.TravelMode.DRIVING,
        })
        console.log(results);


        // Extract route points
        // const route = results.routes[0].legs[0].steps.map(step => {
        //     return step.start_location; // You can also use step.end_location
        // });

        // Check proximity for a specific location (e.g., origin)
        // const locationToCheck = { lat: 7.228802,  lng: 80.200791 };


        // console.log(isClose ? "Location is close to the route" : "Location is not close to the route");
    

    setDirectionsResponse(results)
    // setDistance(results.routes[0].legs[0].distance.text)
    // setDuration(results.routes[0].legs[0].duration.text)
}

const onRouteChange = (e) => {
    console.log(e.target.value);
    calculateRoute('Colombo', e.target.value);
    
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
                ><Select
                    defaultValue="FarmerCustomer"
                    onChange={onRouteChange}
                    borderColor="gray.600"
                    color="gray.600"
                    focusBorderColor="teal.400"
                    backgroundColor={'gray.100'}
                    borderRadius={10}
                    margin={15}
                    marginRight={15}
                    marginLeft={15}
                    position={'absolute'}
                    zIndex={100}
                    width={300}
                >   {
                    routes.map((route) => (
                        <option style={{ color: '#000' }} value={route.destination}>{`${route.origin} - ${route.destination}`}</option>
                    ))
                }
                        {/* <option style={{ color: '#000' }} value="LogisticsCompany">Colombo - Kurunegala</option>
                        <option style={{ color: '#000' }} value="TransportProvider">Colombo - Kandy</option>
                        <option style={{ color: '#000' }} value="FarmerCustomer">Colombo - Warakapola</option> */}
                    </Select>
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
                            <Marker position={currentLocation} />
                            {directionsResponse && (
                                <DirectionsRenderer directions={directionsResponse} />
                            )}
                        </GoogleMap>
                    </Box>

                </Flex>
            ) : (
                <Loader />
            )}
        </div>


    );
};

export default Page;