"use client";
import {
    Box,
    Grid,
    Heading,
    Text,
    Card,
    CardBody,
    Flex,
    Icon,
    useColorModeValue,
    Badge,
    VStack,
    Divider,
} from "@chakra-ui/react";
import { FaCar, FaFlagCheckered, FaMapMarkerAlt, FaMapPin, FaTruck, FaMapSigns } from "react-icons/fa";
import { useCookies } from "react-cookie";
import jwt from "jsonwebtoken";
import api from "../lib/axios";
import { useEffect, useState } from "react";

const AdminDashboardPage = () => {
    const [cookies] = useCookies(["auth-token"]);
    const [ongingRoutes, setOngingRoutes] = useState([]);

    useEffect(() => {
        getAllOnGoingRoutes();
    }, []);

    const getAllOnGoingRoutes = async () => {
        const token = cookies["auth-token"];
        const decodedUserData = jwt.decode(token);
        try {
            const response = await api.get(`admin/getallongingroutes/${decodedUserData.userId}`);
            if (response?.data) {
                console.log(response.data);
                
                setOngingRoutes(response.data);
            }
        } catch (error) {
            console.error("error", error);
        }
    };

    // Color mode values for light/dark mode support
    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorderColor = useColorModeValue("gray.200", "gray.700");
    const gradient = useColorModeValue(
        "linear(to-r, teal.400, blue.500)",
        "linear(to-r, teal.600, blue.700)"
    );
    const textColor = useColorModeValue("gray.700", "gray.200");

    return (
        <Box p={6}>
            <Heading as="h2" size="xl" mb={8} color={textColor}>
                Routes on the way
            </Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={8}>
                {ongingRoutes.map((selectedRoute, index) => (
                    <Card
                        key={index}
                        bg={cardBg}
                        borderWidth="1px"
                        borderColor={cardBorderColor}
                        borderRadius="xl"
                        overflow="hidden"
                        boxShadow="lg"
                        maxWidth={'600px'}
                    // transition="transform 0.2s, box-shadow 0.2s"
                    // _hover={{ transform: "translateY(-5px)", boxShadow: "2xl" }}
                    >
                        <Box
                            bgGradient={gradient}
                            h="120px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                        >
                            <Icon as={FaMapSigns} w={8} h={8} color="white" />
                            <Badge
                                position="absolute"
                                bottom="4"
                                right="4"
                                colorScheme="teal"
                                fontSize="sm"
                                px={3}
                                py={1}
                                borderRadius="full"
                            >
                                On the way
                            </Badge>
                        </Box>
                        <CardBody p={6}>
                            <Flex direction="row" gap={4} justifyContent={"space-between"}>
                                <Flex direction="column" gap={4}>
                                    {/* Origin and Destination */}
                                    <Flex align="center" gap={3}>
                                        <Icon as={FaMapMarkerAlt} w={5} h={5} color="teal.500" />
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">
                                                From
                                            </Text>
                                            <Text fontWeight="bold" color={textColor}>
                                                {selectedRoute.origin}
                                            </Text>
                                        </Box>
                                    </Flex>
                                    <Flex align="center" gap={3}>
                                        <Icon as={FaFlagCheckered} w={5} h={5} color="blue.500" />
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">
                                                To
                                            </Text>
                                            <Text fontWeight="bold" color={textColor}>
                                                {selectedRoute.destination}
                                            </Text>
                                        </Box>
                                    </Flex>

                                    {/* Vehicle Details */}
                                    <Flex align="center" gap={3}>
                                        <Icon as={FaCar} w={5} h={5} color="orange.500" />
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">
                                                Vehicle No
                                            </Text>
                                            <Text fontWeight="bold" color={textColor}>
                                                {selectedRoute.vehicle?.licensePlateNumber}
                                            </Text>
                                        </Box>
                                    </Flex>
                                    <Flex align="center" gap={3}>
                                        <Icon as={FaTruck} w={5} h={5} color="purple.500" />
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">
                                                Capacity
                                            </Text>
                                            <Text fontWeight="bold" color={textColor}>
                                                {selectedRoute.vehicle?.containerCapacity} ㎥
                                            </Text>
                                        </Box>
                                    </Flex>

                                    {/* Waypoints */}
                                    <Flex align="start" gap={3}>
                                        <Icon as={FaMapPin} w={5} h={5} color="pink.500" />
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">
                                                Waypoints
                                            </Text>
                                            <Box mt={1}>
                                                {selectedRoute?.waypoints?.map((point, index) => (
                                                    <Text key={index} fontSize="sm" color={textColor}>
                                                        {point}
                                                    </Text>
                                                ))}
                                            </Box>
                                        </Box>
                                    </Flex>
                                </Flex>
                                {/* Left Side: Customer Requests */}
                                <Box
                                    w="40%"
                                    p={4}
                                    bg={useColorModeValue("gray.50", "gray.700")}
                                    borderRight="1px solid"
                                    borderColor={cardBorderColor}
                                >
                                    <Heading as="h3" size="sm" mb={4} color={textColor}>
                                        Customer Requests
                                    </Heading>
                                    <VStack align="start" spacing={3}>
                                        {selectedRoute?.customerRequests?.map((request, idx) => (
                                            <Box key={idx} w="100%">
                                                <Flex align="center" justify="space-between">
                                                    <Text fontSize="sm" color={textColor}>
                                                        {request.customerLocation}
                                                    </Text>
                                                    <Badge
                                                        colorScheme={request.driverAccepted ? "green" : "red"}
                                                        fontSize="xs"
                                                        px={2}
                                                        py={1}
                                                        borderRadius="full"
                                                    >
                                                        {request.driverAccepted ? "Accepted" : "Pending"}
                                                    </Badge>
                                                </Flex>
                                                {idx < selectedRoute?.customerRequests.length - 1 && <Divider my={2} />}
                                            </Box>
                                        ))}
                                    </VStack>
                                </Box>

                            </Flex>

                        </CardBody>
                    </Card>
                ))}
            </Grid>
        </Box>
    );
};

export default AdminDashboardPage;