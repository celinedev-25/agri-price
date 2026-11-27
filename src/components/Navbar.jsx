
import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">

        <Link to="/" onClick={closeMenu}
          className="text-2xl font-bold">
          🌱 AgriPrice
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-8 font-semibold">
          <Link to="/">Home</Link>
          <Link to="/crops">Crops</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-3xl"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden flex flex-col bg-green-900 p-5 gap-5">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/crops" onClick={closeMenu}>Crops</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
