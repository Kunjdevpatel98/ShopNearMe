import React, { useState, useRef, useEffect } from 'react';

const ProductRating = ({ product }) => {
    const [showPopover, setShowPopover] = useState(false);
    const popoverRef = useRef(null);

    // Dynamic fake data generation based on product ID for consistency
    const getSeed = (str) => {
        let seed = 0;
        for (let i = 0; i < str.length; i++) {
            seed = ((seed << 5) - seed) + str.charCodeAt(i);
            seed |= 0;
        }
        return Math.abs(seed);
    };

    const seed = getSeed(product.id?.toString() || product.name);
    const rating = (4 + (seed % 10) / 10).toFixed(1);
    const totalReviews = (100 + (seed % 900));

    const breakdown = [
        { stars: 5, percentage: 60 + (seed % 20) },
        { stars: 4, percentage: 15 + (seed % 10) },
        { stars: 3, percentage: 5 + (seed % 5) },
        { stars: 2, percentage: 2 + (seed % 3) },
        { stars: 1, percentage: 1 + (seed % 4) },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setShowPopover(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderStars = (num, size = "w-4 h-4") => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                        key={s}
                        className={`${size} ${s <= Math.round(num) ? 'text-[#FF9900]' : 'text-gray-200'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <div className="relative inline-block" ref={popoverRef}>
            {/* Rating Line */}
            <div
                className="flex items-center gap-1 cursor-pointer group/rating py-1"
                onMouseEnter={() => setShowPopover(true)}
                onClick={() => setShowPopover(!showPopover)}
            >
                <span className="text-sm font-medium text-gray-700">{rating}</span>
                {renderStars(rating, "w-3.5 h-3.5")}
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showPopover ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline whitespace-nowrap">
                    ({totalReviews > 1000 ? (totalReviews / 1000).toFixed(1) + 'K' : totalReviews})
                </span>
            </div>

            {/* Popover */}
            {showPopover && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-200 z-[100] p-5 animate-in fade-in zoom-in duration-200 origin-top-left">
                    {/* Arrow pointer */}
                    <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45"></div>

                    <div className="flex items-center gap-2 mb-1">
                        {renderStars(rating, "w-5 h-5")}
                        <span className="text-lg font-bold text-gray-900">{rating} out of 5</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{totalReviews.toLocaleString()} global ratings</p>

                    <div className="space-y-3 mb-6">
                        {breakdown.map((item) => (
                            <div key={item.stars} className="flex items-center gap-3 group/bar cursor-pointer">
                                <span className="text-sm text-[#007185] hover:underline whitespace-nowrap w-10">{item.stars} star</span>
                                <div className="flex-grow h-5 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                                    <div
                                        className="h-full bg-[#FF9900] rounded-sm transition-all duration-500 shadow-inner"
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-[#007185] hover:underline w-8 text-right">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-center">
                        <span className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer font-medium flex items-center gap-1">
                            See customer reviews <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                        </span>
                    </div>

                    {/* Close button for mobile/touch */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowPopover(false); }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 md:hidden"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductRating;
