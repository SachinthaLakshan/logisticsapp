'use client'
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
    Link,
    Avatar,
    FormControl,
    FormHelperText,
    InputRightElement
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import api from "../lib/axios";
import jwt from 'jsonwebtoken';
const axios = require('axios');
const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Loader2 from "../components/loader/loader2";
import { useCookies } from "react-cookie";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const handleShowClick = () => setShowPassword(!showPassword);
    const router = useRouter();
    const [cookies] = useCookies(['auth-token']);

    useEffect(() => {
        const token = cookies['auth-token'];
        if(token){
            const decodedUserData = jwt.decode(token);
            if(decodedUserData){
                if(decodedUserData.userType == 'LogisticsCompany'){
                    router.push('/companyHome');
                    setIsLoading(false);
                }else if(decodedUserData.userType == 'TransportProvider'){
                    router.push('/transportProviderHome');
                    setIsLoading(false) 
                }else{
                    router.push('/customerHome');
                    setIsLoading(false)
                }
            }else{
                setIsLoading(false);
                router.push('/login');
            }
            
            
        }else{
            setIsLoading(false);
        }
        
    },[]);

    const handleSubmit = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        try {
            const response = await api.post('/user/login', { email, password });
            document.cookie = `auth-token=${response.data.token}; path=/`;
            toast("Login Successful!");
            const decodedUserData = jwt.decode(response.data.token);
            if(decodedUserData.userType == 'LogisticsCompany'){
                router.push('/companyHome');
            }else if(decodedUserData.userType == 'TransportProvider'){
                router.push('/transportProviderHome'); 
            }else{
                router.push('/customerHome');
            }
            setIsLoading(false);
        } catch (err) {
            toast.error(err.message);
            console.error("Login failed:", err);
            setIsLoading(false);
        }
    };

    return (
        <Flex
            flexDirection="column"
            width="100wh"
            height="100vh"
            backgroundColor="gray.900"
            justifyContent="center"
            alignItems="center"
            color="whiteAlpha.900"
        >
            {!isLoading && <>
            <Stack
                flexDir="column"
                mb="2"
                justifyContent="center"
                alignItems="center"
            >
                <Avatar bg="teal.400" />
                <Heading color="teal.200">Welcome</Heading>
                <Box minW={{ base: "90%", md: "468px" }}>
                    <form>
                        <Stack
                            spacing={4}
                            p="1rem"
                            backgroundColor="gray.800"
                            boxShadow="md"
                            borderRadius="md"
                        >
                            <FormControl>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<CFaUserAlt color="gray.500" />}
                                    />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e)=>setEmail(e.target.value)}
                                        placeholder="Email address"
                                        bg="gray.700"
                                        borderColor="gray.600"
                                        _placeholder={{ color: "gray.400" }}
                                        focusBorderColor="teal.400"
                                    />
                                </InputGroup>
                            </FormControl>
                            <FormControl>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        color="gray.500"
                                        children={<CFaLock color="gray.500" />}
                                    />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        bg="gray.700"
                                        borderColor="gray.600"
                                        _placeholder={{ color: "gray.400" }}
                                        focusBorderColor="teal.400"
                                        value={password}
                                        onChange={(e)=>setPassword(e.target.value)}
                                    />
                                    <InputRightElement width="4.5rem">
                                        <Button h="1.75rem" size="sm" onClick={handleShowClick} colorScheme="teal">
                                            {showPassword ? "Hide" : "Show"}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                                {/* <FormHelperText textAlign="right" color="gray.400">
                                    <Link color="teal.300">Forgot password?</Link>
                                </FormHelperText> */}
                            </FormControl>
                            <Button
                                borderRadius="md"
                                type="submit"
                                variant="solid"
                                colorScheme="teal"
                                width="full"
                                onClick={handleSubmit}
                            >
                                Login
                            </Button>
                        </Stack>
                    </form>
                </Box>
            </Stack>
            <Box color="gray.400">
                New to us?{" "}
                <Link color="teal.300" href="/register">
                    Sign Up
                </Link>
            </Box>
            </>}
            {isLoading && <Loader2 />}
        </Flex>
    );
};

export default Login;
