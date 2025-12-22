// // src/components/Navbar.jsx
// import { Link } from "react-router-dom";
// import {
//   HiMiniBars3CenterLeft,
//   HiOutlineHeart,
//   HiOutlineShoppingCart,
// } from "react-icons/hi2";
// import { IoSearchOutline } from "react-icons/io5";
// import { HiOutlineUser } from "react-icons/hi";
// import { useState } from "react";
// import { useSelector } from "react-redux";

// import avatarImg from "../assets/avatar.png";        // 🔥 đi lên 1 cấp
// import { useAuth } from "../context/AuthContext";    // 🔥 đi lên 1 cấp

// const navigation = [
//   { name: "Dashboard", href: "/user-dashboard" },
//   { name: "Orders", href: "/orders" },
//   { name: "Cart Page", href: "/cart" },
//   { name: "Check Out", href: "/checkout" },
// ];

// const Navbar = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const cartItems = useSelector((state) => state.cart.cartItems);

//   const { currentUser, logout } = useAuth();

//   const handleLogOut = () => {
//     logout();
//   };

//   const token = localStorage.getItem("token");

//   return (
//     <header className="max-w-screen-2xl mx-auto px-4 py-6">
//       <nav className="flex justify-between items-center">
//         {/* left side */}
//         <div className="flex items-center md:gap-16 gap-4">
//           <Link to="/">
//             <HiMiniBars3CenterLeft className="size-6" />
//           </Link>

//           {/* search input */}
//           <div className="relative sm:w-72 w-40 space-x-2">
//             <IoSearchOutline className="absolute inline-block left-3 inset-y-2" />
//             <input
//               type="text"
//               placeholder="Search here"
//               className="bg-[#EAEAEA] w-full py-1 md:px-8 px-6 rounded-md focus:outline-none"
//             />
//           </div>
//         </div>

//         {/* right side */}
//         <div className="relative flex items-center md:space-x-3 space-x-2">
//           <button className="hidden md:inline-flex px-3 py-1 bg-secondary rounded-md text-white hover:bg-primary transition">
//             <HiOutlineHeart className="size-5 mr-1" />
//             Wishlist
//           </button>

//           {/* cart icon */}
//           <Link to="/cart" className="relative">
//             <HiOutlineShoppingCart className="size-6" />
//             {cartItems.length > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-1">
//                 {cartItems.length}
//               </span>
//             )}
//           </Link>

//           {/* user dropdown */}
//           <div className="relative">
//             <button
//               onClick={() => setIsDropdownOpen((prev) => !prev)}
//               className="flex items-center gap-2"
//             >
//               <img
//                 src={avatarImg}
//                 alt="avatar"
//                 className="w-8 h-8 rounded-full object-cover"
//               />
//               <HiOutlineUser className="size-5" />
//             </button>

//             {isDropdownOpen && (
//               <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md py-2 z-20">
//                 {token && currentUser ? (
//                   <>
//                     <p className="px-4 py-2 text-sm text-gray-700">
//                       {currentUser.name || currentUser.email}
//                     </p>
//                     <button
//                       onClick={handleLogOut}
//                       className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     >
//                       Logout
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <Link
//                       to="/login"
//                       className="block px-4 py-2 text-sm hover:bg-gray-100"
//                     >
//                       Login
//                     </Link>
//                     <Link
//                       to="/register"
//                       className="block px-4 py-2 text-sm hover:bg-gray-100"
//                     >
//                       Register
//                     </Link>
//                   </>
//                 )}

//                 {/* menu items */}
//                 <div className="border-t mt-2 pt-2">
//                   {navigation.map((item) => (
//                     <Link
//                       key={item.name}
//                       to={item.href}
//                       className="block px-4 py-1 text-sm hover:bg-gray-100"
//                     >
//                       {item.name}
//                     </Link>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Navbar;


// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import {
  HiMiniBars3CenterLeft,
  HiOutlineHeart,
  HiOutlineShoppingCart,
} from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import avatarImg from "../assets/avatar.png";
import { useAuth } from "../context/AuthContext";
import { clearCart } from "../redux/features/cart/cartSlice";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser, logout } = useAuth();

  const handleLogOut = () => {
    dispatch(clearCart());
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    } else {
      navigate("/books");
    }
  };

  const token = localStorage.getItem("token");
  const isAdmin = currentUser?.role === "ADMIN";

  // 👉 Navigation menu - khác nhau cho Admin và User
  const navigation = isAdmin
    ? [
        // Admin chỉ có Dashboard (các chức năng khác đã có trong sidebar của DashboardLayout)
        { name: "Dashboard", href: "/dashboard" },
      ]
    : [
        // User menu - removed "Dashboard" as it's redundant with Order History in Profile
        { name: "Browse Books", href: "/books" },
        { name: "Profile", href: "/profile" },
        { name: "Orders", href: "/orders" },
        { name: "Addresses", href: "/addresses" },
        { name: "Cart Page", href: "/cart" },
        { name: "Check Out", href: "/checkout" },
      ];

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
      <nav className="flex justify-between items-center">
        {/* left side */}
        <div className="flex items-center md:gap-16 gap-4">
          <Link to="/">
            <HiMiniBars3CenterLeft className="size-6" />
          </Link>

          {/* search input */}
          <form onSubmit={handleSearch} className="relative sm:w-72 w-40">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books..."
              className="bg-[#EAEAEA] w-full py-2 pl-10 pr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>
        </div>

        {/* right side */}
        <div className="relative flex items-center md:space-x-3 space-x-2">
          {/* Wishlist - chỉ hiện cho User, không hiện cho Admin */}
          {!isAdmin && (
            <Link 
              to="/wishlist" 
              className="hidden md:inline-flex px-3 py-1 bg-secondary rounded-md text-white hover:bg-primary transition"
            >
              <HiOutlineHeart className="size-5 mr-1" />
              Wishlist
            </Link>
          )}

          {/* cart icon - chỉ hiện cho User, không hiện cho Admin */}
          {!isAdmin && (
            <Link to="/cart" className="relative">
              <HiOutlineShoppingCart className="size-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-1 min-w-[18px] text-center">
                  {/* ✅ FIX: Hiển thị số lượng unique books, không phải tổng quantity */}
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}

          {/* user dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2"
            >
              <img
                src={avatarImg}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <HiOutlineUser className="size-5" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md py-2 z-20">
                {token && currentUser ? (
                  <>
                    <p className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      {isAdmin ? 'Super Admin' : (currentUser.name || currentUser.email)}
                    </p>
                    <button
                      onClick={handleLogOut}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Register
                    </Link>
                  </>
                )}

                {/* menu items - chỉ hiện nếu có navigation items */}
                {navigation.length > 0 && (
                  <div className="border-t mt-2 pt-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-1 text-sm hover:bg-gray-100"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
