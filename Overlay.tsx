import React, { useRef, useState } from 'react';

interface OverlayProps {
  onStart: () => void;
  started: boolean;
  detected: boolean;
  onPhotosUploaded: (urls: string[]) => void;
}

const Overlay: React.FC<OverlayProps> = ({ onStart, started, detected, onPhotosUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoCount, setPhotoCount] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      const urls = files.map(file => URL.createObjectURL(file));
      onPhotosUploaded(urls);
      setPhotoCount(urls.length);
    }
  };

  if (started) {
    return (
      <div className="absolute top-4 left-0 w-full flex justify-center pointer-events-none z-40">
        <div className="text-center w-full px-4">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gold-gradient drop-shadow-md mb-2 tracking-tight">
            The Grand Tree
            </h1>
            <div className="bg-black/40 backdrop-blur-md border-y border-[#D4AF37] py-2 px-8 inline-block pointer-events-auto transition-all duration-500 rounded-lg">
                 {!detected ? (
                    <div className="flex flex-col items-center">
                        <p className="text-[#cfc09f] font-serif tracking-widest text-xs md:text-sm animate-pulse">
                            Waiting for Hand Gesture...
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">Make sure your hand is visible in the camera box</p>
                    </div>
                 ) : (
                    <div className="text-[#ffecb3] font-serif text-xs md:text-sm space-y-1">
                        <p><span className="text-[#D4AF37] font-bold">OPEN HAND</span> to Unleash Chaos</p>
                        <p><span className="text-[#D4AF37] font-bold">CLOSED HAND</span> to Restore Order</p>
                    </div>
                 )}
            </div>
            {/* Re-upload button in corner */}
             <div className="fixed top-4 right-4 pointer-events-auto">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] md:text-xs text-[#D4AF37] border border-[#D4AF37] px-3 py-1 bg-black/50 hover:bg-[#D4AF37] hover:text-black transition-colors uppercase tracking-widest font-serif rounded"
                >
                  Edit Photos
                </button>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#021a12] bg-opacity-95 overflow-hidden">
      <div className="max-w-lg w-full p-8 mx-4 border-2 border-[#D4AF37] relative text-center shadow-[0_0_50px_rgba(212,175,55,0.2)] bg-[#021a12]/80 backdrop-blur-sm">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#D4AF37] -mt-1 -ml-1"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#D4AF37] -mt-1 -mr-1"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#D4AF37] -mb-1 -ml-1"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#D4AF37] -mb-1 -mr-1"></div>

        <h1 className="text-4xl md:text-6xl font-serif font-bold text-gold-gradient mb-6 leading-tight">
            Make Christmas<br/>Great Again
        </h1>
        
        <p className="text-[#cfc09f] font-serif mb-8 leading-relaxed text-sm md:text-base">
            A tremendous, high-fidelity 3D experience. <br/>
            Control the tree with your hand gestures. <br/>
            <span className="text-white opacity-80 italic">Upload your own photos to make it truly personal.</span>
        </p>

        <div className="flex flex-col gap-4 items-center w-full max-w-sm mx-auto">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple 
                accept="image/*"
                className="hidden" 
            />
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="group relative px-6 py-4 bg-transparent overflow-hidden w-full cursor-pointer hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-shadow"
            >
                 <span className="relative z-10 font-bold tracking-widest text-[#D4AF37] group-hover:text-[#021a12] transition-colors duration-300 text-xs md:text-sm flex items-center justify-center gap-2">
                    {photoCount > 0 ? (
                        <>✓ {photoCount} PHOTOS LOADED</>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            UPLOAD YOUR MEMORIES
                        </>
                    )}
                </span>
                <div className="absolute inset-0 border border-[#D4AF37] border-dashed opacity-50"></div>
                <div className="absolute inset-0 bg-[#D4AF37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>

            <button 
                onClick={onStart}
                className="group relative px-8 py-4 bg-transparent overflow-hidden w-full cursor-pointer hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-shadow mt-2"
            >
                <span className="relative z-10 font-bold tracking-widest text-[#D4AF37] group-hover:text-[#021a12] transition-colors duration-300 text-sm md:text-lg">
                    ENTER EXPERIENCE
                </span>
                <div className="absolute inset-0 border-2 border-[#D4AF37]"></div>
                <div className="absolute inset-0 bg-[#D4AF37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
        </div>
        
        <p className="text-[10px] text-[#634f2c] mt-8 uppercase tracking-widest font-serif">
            Requires Camera Access • Desktop Recommended
        </p>
      </div>
    </div>
  );
};

export default Overlay;