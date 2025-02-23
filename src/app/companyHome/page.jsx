'use client'
import { Flex, Heading, Input, Button, Stack, FormControl, FormLabel, Box } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "../lib/axios";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import Loader from "../components/loader/loader";
import AdminLayout from "../components/AdminLayout/AdminLayout";
import AdminDashboardPage from "../pages/adminDashboardPage";
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
        
        <AdminLayout>
            <AdminDashboardPage/>
        </AdminLayout>


    );
};

export default Page;