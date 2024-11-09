'use client'
import {
    Flex
} from "@chakra-ui/react";
import { BounceLoader } from "react-spinners";


const Loader = () => {

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
            <BounceLoader color="rgb(129,230,217)" />
        </Flex>
    );
};

export default Loader;
