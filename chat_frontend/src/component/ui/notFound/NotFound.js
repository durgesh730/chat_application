import React from 'react'
import notFound from '../../../assets/images/notFound.jpg'

const NotFound = () => {
  return (
    <div className='pt-4'>
      <img src={notFound} className='w-[40%] mx-auto' alt='Not Found Image' />
    </div>
  )
}

export default NotFound
