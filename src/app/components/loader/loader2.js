'use client'
import {
    Flex
} from "@chakra-ui/react";
import { BounceLoader } from "react-spinners";


const Loader2 = () => {

    return (
        <Flex
            flexDirection="column"
            width="100%"
            height="100vh"
             backgroundColor="rgba(0, 0, 0, 0.3)"
            justifyContent="center"
            alignItems="center"
            color="whiteAlpha.900"
            position={"absolute"}
            zIndex={100}
        >
            <BounceLoader color="rgb(129,230,217)" />
        </Flex>
    );
};

export default Loader2;
