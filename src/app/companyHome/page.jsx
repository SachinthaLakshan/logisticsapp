'use client'
import { Flex, Heading, Input, Button, Stack, FormControl, FormLabel, Box } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "../lib/axios";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import Loader from "../components/loader/loader";
import AdminLayout from "../components/AdminLayout/AdminLayout";
const Page = () => {
    const [waypoints, setWaypoints] = useState([]);
    const [lorryRegNumber, setLorryRegNumber] = useState("DAV-4567");
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process?.env?.NEXT_PUBLIC_API_KEY,
        libraries: ['places'],
    })
    /** @type React.MutableRefObject<HTMLInputElement> */
    const originRef = useRef()
    /** @type React.MutableRefObject<HTMLInputElement> */
    const destiantionRef = useRef()
    /** @type React.MutableRefObject<HTMLInputElement> */
    const waypointRef = useRef()
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let data = { origin:originRef.current.value, destination:destiantionRef.current.value, waypoints, lorryRegNumber };
            const response = await api.post('/direction/create', data);
            if(response){
                toast("Register Successful!");
                originRef.current.value = '';
                destiantionRef.current.value = '';
                waypointRef.current.value = ''; 
                setWaypoints([]);
                setLorryRegNumber('');
            }
            
        } catch (err) {
            console.error("Registration failed:", err);
            toast.error(err.response.data.message);
        }
    };

    const handleAddWaypoint = () => {
       
            setWaypoints([...waypoints, waypointRef.current.value]);
       
    };
    return (
        // <div>
        //     {isLoaded ?
        //         <Flex flexDirection="column" width="100vw" height="100vh" backgroundColor="gray.900" color="whiteAlpha.900" overflowY="auto">
        //             <Stack flexDir="column" mb="2" justifyContent="center" alignItems="center" spacing={4} padding={4}>
        //                 <Heading color="teal.200">Transport Registration</Heading>
        //                 <form onSubmit={handleSubmit}>
        //                     <Stack spacing={4} p="1rem" backgroundColor="gray.800" boxShadow="md" borderRadius="md">
        //                         <FormControl>
        //                             <FormLabel>Origin</FormLabel>
        //                             <Autocomplete>
        //                                 <Input type='text' placeholder='Origin' ref={originRef} />
        //                             </Autocomplete>
        //                         </FormControl>
        //                         <FormControl>
        //                             <FormLabel>Destination</FormLabel>
        //                             <Autocomplete>
        //                                 <Input
        //                                     type='text'
        //                                     placeholder='Destination'
        //                                     ref={destiantionRef}
        //                                 />
        //                             </Autocomplete>
        //                         </FormControl>
        //                         <FormControl>
        //                             <FormLabel>Way points</FormLabel>
        //                             <Autocomplete>
        //                                 <Input
        //                                     type='text'
        //                                     placeholder='Add waypoint'
        //                                     ref={waypointRef}                                        />
        //                             </Autocomplete>
                                    
        //                             <Button mt={2} onClick={handleAddWaypoint} colorScheme="teal">Add Waypoint</Button>
        //                         </FormControl>
        //                         {/* Displaying the list of waypoints */}
        //                         {waypoints.length > 0 && <Box mt={2}>
        //                             <Heading size="sm">Waypoints:</Heading>
        //                             {waypoints.length > 0 ? (
        //                                 waypoints.map((waypoint, index) => (
        //                                     <Box key={index} p={1} borderRadius="md" bg="gray.700" my={1}>
        //                                         {waypoint}
        //                                     </Box>
        //                                 ))
        //                             ) : (
        //                                 <Box>No waypoints added yet.</Box>
        //                             )}
        //                         </Box>}
        //                         <FormControl>
        //                             <FormLabel>Lorry Registration Number</FormLabel>
        //                             <Input type="text" value={lorryRegNumber} onChange={(e) => setLorryRegNumber(e.target.value)} />
        //                         </FormControl>
        //                         <Button borderRadius="md" type="submit" variant="solid" colorScheme="teal" width="full">
        //                             Register
        //                         </Button>
        //                     </Stack>
        //                 </form>
        //             </Stack>
        //         </Flex>
        //         : <Loader />
        //     }

        // </div>
        <div>
            <AdminLayout/>
        </div>


    );
};

export default Page;