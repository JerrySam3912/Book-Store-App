import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import footerLogo  from "../assets/footer-logo.png"
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa"
import { useSubscribeMutation } from '../redux/features/subscriptions/subscriptionsApi'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribe, { isLoading }] = useSubscribeMutation()
  const { currentUser } = useAuth()

  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    if (!email) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter your email address',
      })
      return
    }

    try {
      const result = await subscribe({
        email,
        name: currentUser?.name || currentUser?.username || null,
      }).unwrap()

      Swal.fire({
        icon: 'success',
        title: 'Subscribed!',
        text: result.message || 'Thank you for subscribing to our newsletter!',
        timer: 3000,
        showConfirmButton: false,
      })
      setEmail('')
    } catch (error) {
      Swal.fire({
        icon: error?.data?.message?.includes('already') ? 'info' : 'error',
        title: error?.data?.message?.includes('already') ? 'Already Subscribed' : 'Error',
        text: error?.data?.message || 'Failed to subscribe. Please try again.',
      })
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About & Logo */}
          <div className="space-y-4">
            <img src={footerLogo} alt="BookStore Logo" className="w-40 h-auto mb-4" />
            <p className="text-sm leading-relaxed text-gray-400">
              Your trusted online bookstore offering a vast collection of books across all genres. 
              Discover your next great read with us.
            </p>
            <div className="flex gap-4 pt-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-500 transition-colors duration-300"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-pink-500 transition-colors duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/books" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Browse Books
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/addresses" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Manage Addresses
                </Link>
              </li>
              <li>
                <a href="#shipping" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#returns" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Stay Connected</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for exclusive deals, new releases, and reading recommendations.
            </p>
            <form onSubmit={handleSubscribe} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </form>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <FaEnvelope className="text-blue-500" size={14} />
                <span>support@bookstore.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <FaPhone className="text-blue-500" size={14} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <FaMapMarkerAlt className="text-blue-500 mt-1" size={14} />
                <span>123 Book Street, Reading City, RC 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p>&copy; {currentYear} BookStore. All rights reserved.</p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
              <a href="#privacy" className="text-gray-500 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <span className="text-gray-600">|</span>
              <a href="#terms" className="text-gray-500 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <span className="text-gray-600">|</span>
              <a href="#cookies" className="text-gray-500 hover:text-white transition-colors duration-200">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer