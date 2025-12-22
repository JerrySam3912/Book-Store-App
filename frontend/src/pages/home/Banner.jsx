import React, { useState } from 'react'
import bannerImg from "../../assets/banner.png"
import { useSubscribeMutation } from '../../redux/features/subscriptions/subscriptionsApi'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'

const Banner = () => {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
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
        text: result.message || 'Thank you for subscribing! You will receive updates about new book releases.',
        timer: 3000,
        showConfirmButton: false,
      })
      setEmail('')
      setShowSubscribeModal(false)
    } catch (error) {
      Swal.fire({
        icon: error?.data?.message?.includes('already') ? 'info' : 'error',
        title: error?.data?.message?.includes('already') ? 'Already Subscribed' : 'Error',
        text: error?.data?.message || 'Failed to subscribe. Please try again.',
      })
    }
  }

  return (
    <>
      <div className='flex flex-col md:flex-row-reverse py-16 justify-between items-center gap-12'>
        <div className='md:w-1/2 w-full flex items-center md:justify-end'>
          <img src={bannerImg} alt="" />
        </div>
        
        <div className='md:w-1/2 w-full'>
          <h1 className='md:text-5xl text-2xl font-medium mb-7'>New Releases This Week</h1>
          <p className='mb-10'>It's time to update your reading list with some of the latest and greatest releases in the literary world. From heart-pumping thrillers to captivating memoirs, this week's new releases offer something for everyone</p>

          <button 
            onClick={() => setShowSubscribeModal(true)}
            className='btn-primary'
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-6">
              Get notified about new book releases, special offers, and exclusive deals!
            </p>
            <form onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                required
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubscribeModal(false)
                    setEmail('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Banner