import Image from "next/image";
import MyComponent from "./components/map";
import LoginPage from "./pages/Login";
import Login from "./pages/Login";
import { ToastContainer } from 'react-toastify';

export default function Home() {
  return (
    <div >
      <main >
       
        <Login/>
       
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
