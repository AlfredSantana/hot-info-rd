import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import BreakingBar from "./BreakingBar.jsx";

export default function Layout() {
  return (
    <>
      <BreakingBar />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
