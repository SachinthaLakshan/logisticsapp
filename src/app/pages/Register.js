'use client';
import {
    Flex,
    Heading,
    Input,
    Button,
    InputGroup,
    Stack,
    InputLeftElement,
    chakra,
    Box,
    Avatar,
    FormControl,
    FormLabel,
    Select
} from "@chakra-ui/react";
import { useState } from "react";
import { FaUserAlt, FaLock, FaPhone, FaAddressBook } from "react-icons/fa";
import api from "../lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);
const CFaPhone = chakra(FaPhone);
const CFaAddress = chakra(FaAddressBook);

const Register = () => {
    const [userType, setUserType] = useState("FarmerCustomer");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState("");
    const [fullName, setFullName] = useState("");
    const [fleetDetails, setFleetDetails] = useState({});
    const router = useRouter();

    const handleFleetDetailChange = (field, value) => {
        const updatedFleetDetails = { ...fleetDetails };
        updatedFleetDetails[field] = value;
        setFleetDetails(updatedFleetDetails);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        
        try {
            let data = {
                password:password,
                email:email,
                userType:userType,
                contactNumber:contactNumber,
                fullName:fullName,
                vehicleDetails:fleetDetails
            }
            await api.post('/user/register', data);
            console.log("Registration successful");
            toast("Registration Successful!");
            router.push('/login');
        } catch (err) {
            console.error("Registration failed:", err);
            toast.error(err.response.data.message);
        }
    };

    return (
        <Flex
            flexDirection="column"
            width="100vw"
            height="100vh"
            backgroundColor="gray.900"
            color="whiteAlpha.900"
            overflowY="auto" // Make the entire page scrollable
        >
            <Stack
                flexDir="column"
                mb="2"
                justifyContent="center"
                alignItems="center"
                spacing={4} // Add some spacing between items
                padding={4} // Add padding for better aesthetics
            >
                <Avatar bg="teal.400" />
                <Heading color="teal.200">Register</Heading>
                <Box minW={{ base: "90%", md: "468px" }}>
                    <form onSubmit={handleSubmit}>
                        <Stack
                            spacing={4}
                            p="1rem"
                            backgroundColor="gray.800"
                            boxShadow="md"
                            borderRadius="md"
                        >
                            <FormControl>
                                <FormLabel>User Type</FormLabel>
                                <Select
                                    defaultValue="FarmerCustomer"
                                    bg="gray.700"
                                    borderColor="gray.600"
                                    color="whiteAlpha.900"
                                    focusBorderColor="teal.400"
                                    onChange={(e) => setUserType(e.target.value)}
                                >
                                    <option style={{ color: '#000' }} value="LogisticsCompany">Logistics Company</option>
                                    <option style={{ color: '#000' }} value="TransportProvider">Transport Provider</option>
                                    <option style={{ color: '#000' }} value="FarmerCustomer">Farmer Customer</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<CFaUserAlt color="gray.500" />}
                                    />
                                    <Input
                                        type="email"
                                        placeholder="Email address"
                                        bg="gray.700"
                                        borderColor="gray.600"
                                        _placeholder={{ color: "gray.400" }}
                                        focusBorderColor="teal.400"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </InputGroup>
                            </FormControl>
                            <FormControl>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<CFaLock color="gray.500" />}
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        bg="gray.700"
                                        borderColor="gray.600"
                                        _placeholder={{ color: "gray.400" }}
                                        focusBorderColor="teal.400"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </InputGroup>
                            </FormControl>
                            <FormControl>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<CFaPhone color="gray.500" />}
                                    />
                                    <Input
                                        type="tel"
                                        placeholder="Contact Number"
                                        bg="gray.700"
                                        borderColor="gray.600"
                                        _placeholder={{ color: "gray.400" }}
                                        focusBorderColor="teal.400"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                    />
                                </InputGroup>
                            </FormControl>
                            <FormControl>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<CFaAddress color="gray.500" />}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Full Name (if applicable)"
                                        bg="gray.700"
                                        borderColor="gray.600"
                                        _placeholder={{ color: "gray.400" }}
                                        focusBorderColor="teal.400"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </InputGroup>
                            </FormControl>
                            {userType === "LogisticsCompany" && (
                                <>
                                    <FormControl>
                                        <Input
                                            placeholder="Company Name"
                                            bg="gray.700"
                                            borderColor="gray.600"
                                            _placeholder={{ color: "gray.400" }}
                                            focusBorderColor="teal.400"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <Input
                                            placeholder="Business Registration Number"
                                            bg="gray.700"
                                            borderColor="gray.600"
                                            _placeholder={{ color: "gray.400" }}
                                            focusBorderColor="teal.400"
                                            value={businessRegistrationNumber}
                                            onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                                        />
                                    </FormControl>
                                </>
                            )}
                            {userType === "TransportProvider" && (
                                <>
                                    <Heading size="sm" color="teal.200" mt={4}>Vehicle Details</Heading>
                                    <Stack spacing={2} bg="gray.700" p={3} borderRadius="md">
                                        <FormControl>
                                            <FormLabel>License Plate Number</FormLabel>
                                            <Input
                                                type="text"
                                                value={fleetDetails.licensePlateNumber}
                                                onChange={(e) => handleFleetDetailChange('licensePlateNumber', e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Height</FormLabel>
                                            <Input
                                                type="number"
                                                value={fleetDetails.height}
                                                onChange={(e) => handleFleetDetailChange('height', e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Length</FormLabel>
                                            <Input
                                                type="number"
                                                value={fleetDetails.length}
                                                onChange={(e) => handleFleetDetailChange('length', e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Width</FormLabel>
                                            <Input
                                                type="number"
                                                value={fleetDetails.width}
                                                onChange={(e) => handleFleetDetailChange('width', e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Container Capacity</FormLabel>
                                            <Input
                                                type="number"
                                                value={fleetDetails.containerCapacity}
                                                onChange={(e) => handleFleetDetailChange('containerCapacity', e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Maximum Load Capacity</FormLabel>
                                            <Input
                                                type="number"
                                                value={fleetDetails.maximumLoadCapacity}
                                                onChange={(e) => handleFleetDetailChange('maximumLoadCapacity', e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Vehicle Type</FormLabel>
                                            <Input
                                                type="text"
                                                value={fleetDetails.vehicleType}
                                                onChange={(e) => handleFleetDetailChange('vehicleType', e.target.value)}
                                            />
                                        </FormControl>
                                    </Stack>
                                </>
                            )}
                            <Button
                                borderRadius="md"
                                type="submit"
                                variant="solid"
                                colorScheme="teal"
                                width="full"
                            >
                                Register
                            </Button>
                        </Stack>
                    </form>
                </Box>
            </Stack>
            {/* Uncomment this to add a link to the login page */}
            {/* <Box color="gray.400" mt={4}>
                Already have an account? <Link href="/login">Login</Link>
            </Box> */}
        </Flex>
    );
};

export default Register;
