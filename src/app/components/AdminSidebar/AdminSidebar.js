import { Box, VStack, Link, Text, Avatar, Button } from '@chakra-ui/react';
import { usePathname, useRouter } from "next/navigation"; // Use next/router instead of next/navigation
import { use, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { FaTachometerAlt, FaBusAlt , FaUsers,FaMapMarkedAlt  } from 'react-icons/fa'; // Importing icons

const AdminSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [cookie, setCookie, removeCookie] = useCookies();
    const menuItems = [
        { name: 'Dashboard', path: '/companyHome', icon: <FaTachometerAlt /> },
        { name: 'Vehicles', path: '/companyHome/vehiclesPage', icon: <FaBusAlt  /> },
        { name: 'Routes', path: '/companyHome/routesPage', icon: <FaMapMarkedAlt /> },
        { name: 'Drivers', path: '/companyHome/driversPage', icon: <FaUsers  /> },
    ];

    const handleLogout = () => {
        removeCookie('auth-token', { path: '/', domain: 'localhost' });
        router.push('/login');
    };
    
    
    return (
        <Box 
            width="250px" 
            bg="gray.800" 
            color="white" 
            height="100vh" 
            position="fixed" 
            boxShadow="lg"
        >
            <Box padding={4} textAlign="center">
                <Avatar name={'user name'} src={'/user.png'} size="lg" mb={2} />
                <Text fontWeight="bold">@{'user name'}</Text>
                <Text fontSize="sm" color="gray.400">{'admin@gmail.com'}</Text>
                <Button 
                    mt={2} 
                    colorScheme="teal" 
                    size="sm" 
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Box>
            <VStack spacing={3} align="stretch" padding={4}>
                {menuItems.map(item => (
                    <Link 
                        key={item.name} 
                        href={item.path} 
                        display="flex" 
                        alignItems="center"
                        paddingY={2}
                        borderRadius="md"
                        _hover={{ bg: 'gray.700' }} // Change background on hover
                        color={pathname === item.path ? 'teal.300' : 'white'}
                    >
                        <Box marginRight={3}paddingLeft={3}>
                            {item.icon}
                        </Box>
                        <Text>{item.name}</Text>
                    </Link>
                ))}
            </VStack>
        </Box>
    );
};

export default AdminSidebar;