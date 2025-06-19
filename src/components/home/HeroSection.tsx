'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className={`md:w-1/2 mb-10 md:mb-0 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 font-heading leading-tight">
              Protecting Children Through Technology
            </h1>
            <p className="text-lg md:text-xl mb-8 md:mb-10 text-blue-100 max-w-lg">
              UNCIP connects parents, schools, and authorities to create a safer environment for children in South African townships.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/register" className="px-6 py-3 bg-white text-blue-700 hover:bg-gray-100 rounded-lg font-medium shadow-lg text-center">
                Get Started
              </Link>
              <Link href="#features" className="px-6 py-3 border-2 border-white text-white hover:bg-white/10 rounded-lg font-medium text-center">
                Learn More
              </Link>
            </div>
          </div>
          <div className={`md:w-1/2 flex justify-center transition-opacity duration-500 delay-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative w-full max-w-md h-72 md:h-96 bg-white/10 rounded-2xl p-1 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <div className="text-center p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 md:h-20 w-16 md:w-20 mx-auto text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-6 text-xl md:text-2xl font-semibold text-white font-heading">Child Safety First</h3>
                  <p className="mt-3 text-base md:text-lg text-blue-100">Rapid identification and response in emergencies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}