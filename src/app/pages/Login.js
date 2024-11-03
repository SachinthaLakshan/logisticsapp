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

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const handleShowClick = () => setShowPassword(!showPassword);

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
                                    />
                                    <InputRightElement width="4.5rem">
                                        <Button h="1.75rem" size="sm" onClick={handleShowClick} colorScheme="teal">
                                            {showPassword ? "Hide" : "Show"}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                                <FormHelperText textAlign="right" color="gray.400">
                                    <Link color="teal.300">Forgot password?</Link>
                                </FormHelperText>
                            </FormControl>
                            <Button
                                borderRadius="md"
                                type="submit"
                                variant="solid"
                                colorScheme="teal"
                                width="full"
                            >
                                Login
                            </Button>
                        </Stack>
                    </form>
                </Box>
            </Stack>
            <Box color="gray.400">
                New to us?{" "}
                <Link color="teal.300" href="#">
                    Sign Up
                </Link>
            </Box>
        </Flex>
    );
};

export default Login;
