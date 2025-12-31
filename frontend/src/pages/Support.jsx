import React, { useEffect, useState, useRef } from "react";
import { FaGithub, FaLinkedin, FaHeart } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Balatro from "../../jsrepo/Balatro/Balatro";
import ShinyText from "../../jsrepo/ShinyText/ShinyText";
import FlowingMenu from "../../jsrepo/FlowingMenu/FlowingMenu";

function SupportPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSocial, setActiveSocial] = useState(0);

  const socialLinks = [
    {
      icon: <FaHeart />,
      name: "Portfolio",
      url: "https://mritunjay-thakur.vercel.app/",
    },
    {
      icon: <FaGithub />,
      name: "GitHub",
      url: "https://github.com/mritunjay-thakur/mritunjay-thakur",
    },
    {
      icon: <FaLinkedin />,
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/mritunjay-thakur-jay/",
    },
    {
      icon: <MdEmail />,
      name: "Email",
      url: "mailto:mritunjaythakur903@gmail.com",
    },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Balatro
          spinRotation={-0.0}
          spinSpeed={2.0}
          offset={[0.1, -0.05]}
          color1="#6a0dad"
          color2="#7f00ff"
          color3="#000000"
          contrast={4.0}
          lighting={0.6}
          spinAmount={0.35}
          pixelFilter={2000}
          spinEase={0.8}
          isRotate={true}
          mouseInteraction={true}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 max-w-6xl mx-auto min-h-screen flex flex-col justify-center items-center">
        <div className="w-full text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-3 sm:mb-4">
            <ShinyText text="Let's Connect" speed={6} baseColor="text-white" />
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-lg mx-auto">
            Have a project in mind, want to collaborate or just want to say hi?
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl h-96 border border-white/20 bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden">
            <FlowingMenu
              items={socialLinks.map((social, index) => ({
                ...social,
                text: social.name,
                isActive: activeSocial === index,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportPage;
