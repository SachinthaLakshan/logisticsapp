'use client'
import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
const Page = () => {
    const router = useRouter();
    return (
        <>
            <h1>Logistics Company home page</h1>
            <Button
                borderRadius="md"
                type="submit"
                variant="solid"
                colorScheme="teal"
                width="full"
                onClick={() => router.push('/login')}
            >
                Back to login
            </Button>
        </>

    );
};

export default Page;