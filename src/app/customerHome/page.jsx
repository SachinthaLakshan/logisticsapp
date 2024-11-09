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
                >
                        <option style={{ color: '#000' }} value="LogisticsCompany">Logistics Company</option>
                        <option style={{ color: '#000' }} value="TransportProvider">Transport Provider</option>
                        <option style={{ color: '#000' }} value="FarmerCustomer">Farmer Customer</option>
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