import localFont from "next/font/local";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { ChakraProvider, theme } from '@chakra-ui/react'
import { Providers } from "./providers.";
import { ToastContainer } from "react-toastify";
import { ContextProvider } from "./lib/socketContext";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "LoadMate",
  description: "Move More Waste Less",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > <ToastContainer/>
      <ContextProvider>
        <Providers>{children}</Providers>
        </ContextProvider>
      </body>
    </html>
  );
}
