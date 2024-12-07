'use client'
import {
    Flex
} from "@chakra-ui/react";
import { BounceLoader } from "react-spinners";


const Loader3 = () => {

    return (
        <Flex
            flexDirection="column"
            width="100%"
            justifyContent="center"
            alignItems="center"
            margin={10}
        >
            <BounceLoader color="rgb(129,230,217)" />
        </Flex>
    );
};

export default Loader3;
