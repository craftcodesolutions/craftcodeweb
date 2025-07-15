import React from 'react'
import HomeSection from './_components/HomeSection'
import FeaturedSection from './_components/FeaturedSection'
import ServicesSection from './_components/ServicesSection'
import TestimonialSection from './_components/TestimonialSection'
import WhyUsSection from './_components/WhyUsSection'
import WhyToUsSection from './_components/WhyToUsSection'
import CoreTechSection from './_components/CoreTechSection'
import SupportSection from './_components/SupportSection'
import BlogSection from './_components/BlogSection'
import CTASection from './_components/CTASection'
import TestimonialsSlider from './_components/TestimonialsSlider'

const Home = () => {
  return (
    <div>
      <HomeSection />
      <FeaturedSection />
      <TestimonialsSlider/>
      <ServicesSection />
      <TestimonialSection/>
      <WhyUsSection/>
      <WhyToUsSection/>
      <CoreTechSection/>
      <SupportSection/>
      <BlogSection/>
      <CTASection/> 
      
    </div>
  )
}

export default Home
