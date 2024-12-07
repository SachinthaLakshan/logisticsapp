
"use client"
import { Box } from '@chakra-ui/react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';

const AdminLayout = ({ children }) => {
    return (
        <>
            <AdminSidebar />
            <Box marginLeft="250px" padding={4}>
                {children}
            </Box>
        </>
    );
};

export default AdminLayout;