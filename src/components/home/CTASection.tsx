'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    const element = document.querySelector('.cta-section');
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section className={`cta-section bg-blue-700 text-white py-12 md:py-16 transition-all duration-700 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 font-heading">Join the UNCIP Network Today</h2>
        <p className="text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto text-blue-100">
          Be part of the solution to create safer communities for children across South Africa.
        </p>
        <Link href="/auth/register" className="inline-block px-6 md:px-8 py-3 md:py-4 bg-white text-blue-700 hover:bg-gray-100 rounded-lg font-medium shadow-xl text-base md:text-lg transition-transform hover:scale-105">
          Register Now
        </Link>
      </div>
    </section>
  );
}