import React from 'react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import { RainbowHighlight } from '@components/RainbowHighlight';
import Image from 'next/image';
import { userData } from '@constants/user-data';

const HERO_WORDS = [
  { text: 'Developer.', color: '#F59E0B' },
  { text: 'Programmer.', color: '#84CC16' },
  { text: 'Engineer.', color: '#10B981' },
  { text: 'Curious person.', color: '#3B82F6' },
];

export const Hero = () => {
  return (
    <div className="flex flex-row justify-center items-start overflow-hidden">
      {/* Text container */}

      <div className="w-full md:w-1/2 mx-auto text-center md:text-left lg:p-20">
        <RoughNotationGroup show={true}>
          {HERO_WORDS.map(({ text, color }) => (
            <RainbowHighlight color={color} key={text} durationScalar={text.length}>
              <h1 className="text-4xl md:text-8xl font-bold text-gray-700 dark:text-gray-200 my-2">{text}</h1>
            </RainbowHighlight>
          ))}
        </RoughNotationGroup>
      </div>
      <div className="hidden lg:block relative w-full md:w-1/2 -mr-40 mt-20">
        <div className="w-3/4 ">
          <Image src={userData.avatarUrl} alt="avatar" className=" shadow" width={200} height={200} />
          <div className="flex flex-row justify-between mt-4">
            <div className="flex flex-row space-x-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-arrow-90deg-up"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M4.854 1.146a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L4 2.707V12.5A2.5 2.5 0 0 0 6.5 15h8a.5.5 0 0 0 0-1h-8A1.5 1.5 0 0 1 5 12.5V2.707l3.146 3.147a.5.5 0 1 0 .708-.708l-4-4z"
                />
              </svg>
              <p className="font-mono">{`That's me`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
