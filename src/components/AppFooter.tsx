"use client";

import React from "react";
import Image from "next/image";

const AppFooter: React.FC = () => {
  return (
    <footer className="mt-16 pt-12 border-t border-slate-800 pb-12 text-center space-y-6">
      <div className="flex flex-col items-center gap-4">
        <a
          href="https://www.buymeacoffee.com/tamooods"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me A Coffee"
            width={217}
            height={60}
          />
        </a>
      </div>

      <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <span>Data from OpenDota API</span>
        <span>Images by Valve Corporation</span>
      </div>
      <p className="max-w-2xl mx-auto text-[9px] text-slate-600 leading-relaxed uppercase">
        Dota 2 is a registered trademark of Valve Corporation. This site is not
        affiliated with or endorsed by Valve. All game assets, images, and names
        are the property of their respective owners. Built for the community
        with love.
      </p>
    </footer>
  );
};

export default AppFooter;
