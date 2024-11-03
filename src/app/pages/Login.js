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
import { useState } from "react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import api from "../lib/axios";
import jwt from 'jsonwebtoken';
const axios = require('axios');
const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleShowClick = () => setShowPassword(!showPassword);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/user/login', { email, password });
            localStorage.setItem('authToken', response.data.token);
            
            toast("Login Successful!");
            const decodedUserData = jwt.decode(response.data.token);
            if(decodedUserData.userType == 'LogisticsCompany'){
                router.push('/companyHome');
            }else if(decodedUserData.userType == 'TransportProvider'){
                router.push('/transportProviderHome'); 
            }else{
                router.push('/customerHome');
            }
        } catch (err) {
            toast.error(err.response.data.message);
            console.error("Login failed:", err);
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
        </Flex>
    );
};

export default Login;
