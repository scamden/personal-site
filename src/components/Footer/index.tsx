import React from 'react';
import { userData } from '@constants/user-data';
import { SocialLogoLinks } from '@components/SocialLogoLinks';

export const Footer = () => {
  return (
    <div className="bg-slate-100 dark:bg-gray-900">
      <div className="max-w-6xl  mx-auto px-4 py-10 md:py-20">
        <div className="h-0.5 w-full bg-white dark:bg-gray-700"></div>
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row justify-between md:items-center mt-8">
          <div>
            <p>&copy;{userData.name}. All Rights Reserved.</p>
          </div>
          <div>
            <div>
              Developed by
              <div className="inline-block transform hover:scale-110 hover:-rotate-3 transition duration-300">
                <a className="hover:bg-red-500 rounded-md px-2 py-1  hover:text-gray-50" href="https://sterlingcamden.com">
                  {userData.name}
                </a>
              </div>
            </div>
          </div>
          <SocialLogoLinks />
        </div>
      </div>
    </div>
  );
};
