
"use client"
import { Box } from '@chakra-ui/react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { useCookies } from 'react-cookie';
import api from '@/app/lib/axios'; ``
import React, { useEffect, useState } from 'react';
import { UserContext } from '@/app/lib/userContext';
import jwt from 'jsonwebtoken';

const AdminLayout = ({ children }) => {

    const [user, setUser] = useState(null);
    const [cookies] = useCookies(['auth-token']);

    useEffect(() => {
        getLogedUser();
    }, []);

    const getLogedUser = async () => {

        const token = cookies['auth-token'];

        const decodedUserData = jwt.decode(token);

        try {
            const response = await api.get(`user/getuser/${decodedUserData.userId}`);
            if (response) {
                if (response.data) {
                    console.log(response.data.data);
                    setUser(response.data.data)
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <>
            <AdminSidebar logedUser={user} />
            <UserContext.Provider value={user}>
                <Box marginLeft="250px" padding={4}>
                    {children}
                </Box>
            </UserContext.Provider>
        </>
    );
};

export default AdminLayout;