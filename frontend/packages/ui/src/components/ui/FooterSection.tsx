// import React from 'react';
// import { 
//   Brain, 
//   Facebook, 
//   Twitter, 
//   Linkedin, 
//   Github, 
//   Instagram,
//   Mail,
//   Phone,
//   MapPin
// } from 'lucide-react';

// const Footer: React.FC = () => {
//   return (
//     <footer className="relative bg-[#061E29] pt-32 pb-12 overflow-hidden text-[#F3F4F4]">
      
//       {/* Background */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#1D546D20_1px,transparent_1px),linear-gradient(to_bottom,#1D546D20_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
//         <div className="absolute inset-0 bg-gradient-to-br from-[#1D546D]/20 via-[#5F9598]/10 to-transparent"></div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          
//           {/* Brand */}
//           <div className="group">
//             <div className="flex items-center mb-8">
//               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D546D] to-[#5F9598] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
//                 <Brain className="h-6 w-6" />
//               </div>
//               <span className="ml-3 text-xl font-bold tracking-tight text-[#F3F4F4]">
//                 VaktarAI
//               </span>
//             </div>

//             <p className="text-[#5F9598] leading-relaxed mb-8">
//               Create hyper-realistic AI avatars for content, branding, and communication — instantly and at scale.
//             </p>

//             <div className="flex space-x-4">
//               {[
//                 { icon: Facebook, href: "#" },
//                 { icon: Twitter, href: "#" },
//                 { icon: Linkedin, href: "#" },
//                 { icon: Github, href: "#" },
//                 { icon: Instagram, href: "#" }
//               ].map((social, idx) => (
//                 <a 
//                   key={idx}
//                   href={social.href} 
//                   className="w-10 h-10 rounded-xl bg-[#1D546D]/20 border border-[#1D546D]/30 flex items-center justify-center text-[#F3F4F4] hover:bg-gradient-to-br hover:from-[#1D546D] hover:to-[#5F9598] hover:text-white hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg"
//                 >
//                   <social.icon size={18} />
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Features / Services */}
//           <div>
//             <h4 className="text-lg font-bold mb-6 text-[#F3F4F4]">Platform</h4>
//             <ul className="space-y-4">
//               {[
//                 "AI Avatar Generation",
//                 "Text-to-Video Avatars",
//                 "Voice Cloning",
//                 "Custom Avatar Training",
//                 "API for Developers"
//               ].map((item, idx) => (
//                 <li key={idx}>
//                   <a href="#" className="text-[#5F9598] hover:text-[#F3F4F4] transition-colors duration-300 flex items-center group">
//                     <span className="w-1.5 h-1.5 rounded-full bg-[#5F9598] mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
//                     {item}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Company */}
//           <div>
//             <h4 className="text-lg font-bold mb-6 text-[#F3F4F4]">Company</h4>
//             <ul className="space-y-4">
//               {[
//                 "About VaktarAI",
//                 "Pricing",
//                 "Use Cases",
//                 "Blog",
//                 "Careers"
//               ].map((item, idx) => (
//                 <li key={idx}>
//                   <a href="#" className="text-[#5F9598] hover:text-[#F3F4F4] transition-colors duration-300 flex items-center group">
//                     <span className="w-1.5 h-1.5 rounded-full bg-[#5F9598] mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
//                     {item}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Contact */}
//           <div>
//             <h4 className="text-lg font-bold mb-6 text-[#F3F4F4]">Contact</h4>
//             <ul className="space-y-4">
//               <li className="text-[#5F9598] flex items-center">
//                 <MapPin className="w-5 h-5 mr-2 text-[#1D546D]" />
//                 Pune, India
//               </li>
//               <li>
//                 <a href="mailto:hello@vaktarai.com" className="text-[#5F9598] hover:text-[#F3F4F4] transition-colors duration-300 flex items-center">
//                   <Mail className="w-5 h-5 mr-2 text-[#1D546D]" />
//                   hello@vaktarai.com
//                 </a>
//               </li>
//               <li>
//                 <a href="tel:+919876543210" className="text-[#5F9598] hover:text-[#F3F4F4] transition-colors duration-300 flex items-center">
//                   <Phone className="w-5 h-5 mr-2 text-[#1D546D]" />
//                   +91 98765 43210
//                 </a>
//               </li>
//             </ul>
//           </div>

//         </div>

//         {/* Bottom */}
//         <div className="mt-24 pt-8 border-t border-[#1D546D]/40 text-center">
//           <p className="text-[#5F9598] text-sm">
//             © {new Date().getFullYear()} VaktarAI. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
import React from 'react';
import { 
  Brain, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Github, 
  Instagram,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#061E29] pt-32 pb-12 overflow-hidden text-[#F3F4F4]">
      
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath d='M 64 0 L 0 0 0 64' fill='none' stroke='%231D546D' stroke-width='0.5' stroke-opacity='0.5'/%3E%3C/svg%3E")`, backgroundSize: '4rem 4rem' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          
          {/* Brand */}
          <div className="group">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#1D546D] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Brain className="h-6 w-6" />
              </div>
              <span className="ml-3 text-xl font-bold tracking-tight text-[#F3F4F4]">
                VaktarAI
              </span>
            </div>

            <p className="text-[#5F9598] leading-relaxed mb-8">
              Create hyper-realistic AI avatars for content, branding, and communication — instantly and at scale.
            </p>

            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Github, href: "#" },
                { icon: Instagram, href: "#" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  className="w-10 h-10 rounded-xl bg-[#1D546D]/20 border border-[#1D546D]/30 flex items-center justify-center text-[#F3F4F4] hover:bg-[#1D546D] hover:text-white hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Features / Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-[#F3F4F4]">Platform</h4>
            <ul className="space-y-4">
              {[
                "AI Avatar Generation",
                "Text-to-Video Avatars",
                "Voice Cloning",
                "Custom Avatar Training",
                "API for Developers"
              ].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-[#5F9598] hover:text-[#F3F4F4] transition-colors duration-300 flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5F9598] mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-[#F3F4F4]">Company</h4>
            <ul className="space-y-4">
              {[
                "About VaktarAI",
                "Pricing",
                "Use Cases",
                "Blog",
                "Careers"
              ].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-[#5F9598] hover:text-[#F3F4F4] transition-colors duration-300 flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5F9598] mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-[#F3F4F4]">Contact</h4>
            <ul className="space-y-4">
              <li className="text-[#5F9598] flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#1D546D]" />
                Pune, India
              </li>
              <li>
                <a href="mailto:hello@vaktarai.com" className="text-[#5F9598] hover:text-[#F3F4F4] transition-colors duration-300 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-[#1D546D]" />
                  hello@vaktarai.com
                </a>
              </li>
              <li>
                <a href="tel:+919876543210" className="text-[#5F9598] hover:text-[#F3F4F4] transition-colors duration-300 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-[#1D546D]" />
                  +91 98765 43210
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-24 pt-8 border-t border-[#1D546D]/40 text-center">
          <p className="text-[#5F9598] text-sm">
            © {new Date().getFullYear()} VaktarAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;