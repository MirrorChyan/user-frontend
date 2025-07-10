import React, { useEffect, useState } from 'react';

export interface HtmlFormPayPageProps {
  paymentHtml: string;
}

export default function HtmlFormPayPage({ paymentHtml }: HtmlFormPayPageProps) {

  const [iframeSrc, setIframeSrc] = useState<string>('');

  useEffect(() => {
    const blob = new Blob([paymentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setIframeSrc(url);

    return () => URL.revokeObjectURL(url);
  }, []);

  return (
    <div>
      {iframeSrc ? (
        <iframe
          className='p-4 h-[240px] w-[240px] flex items-center justify-center'
          style={{ marginLeft: '10px' }}
          src={iframeSrc}
          sandbox="allow-scripts allow-same-origin"
          title="支付宝支付"
        />
      ) : (
        <div
          className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg h-[240px] w-[240px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg className="animate-spin mb-2 h-16 w-16 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
