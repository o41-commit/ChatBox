import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Fotter";

const Mainlayout = () => {
  return (
    <div>
      <Navbar />
      <main className="pt-20 pb-25">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Mainlayout;
