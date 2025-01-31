
const Overview = (jsonData: any) => {

    const calculateTotals = (data: any) => {
        let totalCollections = 0;
        let totalEventListeners = 0;
        let totalDomNodes = 0;
        let totalObjects = 0;

        data.forEach((entry: any) => {
            const leaks = entry?.result?.leaks;
            if (leaks) {
                totalCollections += leaks.collections?.length || 0;
                totalEventListeners += leaks.eventListeners?.length || 0;
                totalDomNodes += leaks.domNodes?.nodes?.length || 0;
                totalObjects += leaks.objects?.length || 0;
            }
        });

        return { totalCollections, totalEventListeners, totalDomNodes, totalObjects };
    };

    const totals = jsonData ? calculateTotals(jsonData.jsonData) : null;

    return (
        <section className="py-3">
            <div className="container px-4 mx-auto">
                <div className="mb-0 mt-0">
                <div className="flex flex-wrap items-center -mx-3 -mb-6">
                    <div className="w-full sm:w-1/2 xl:w-1/4 px-3 mb-6">
                        <div className="max-w-xs md:max-w-none mx-auto p-6 #242525 rounded-xl">
                            <div className="flex flex-wrap items-center -m-2">
                            <div className="w-auto p-2">
                                <div className="flex flex-shrink-0 w-12 h-12 items-center justify-center bg-blue-300 bg-opacity-50 text-blue-500 rounded-xl">
                                    <svg width="100%" height="auto" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="m32.57 24.68c0 .25.75.25.75.25s.21-.54-1-5.83-3.5-8.21-3.67-8.29a8.42 8.42 0 0 0 -1.37-.13 41.46 41.46 0 0 1 2.87 4.59c1.42 2.91 2.42 9.16 2.42 9.41zm2.43-.25c.08.17.42.13.58.09a14.9 14.9 0 0 0 -.45-5 41.77 41.77 0 0 0 -2.25-6.38c-.13-.21-.75-.12-1-.12a32.68 32.68 0 0 1 1.83 4.58 50.41 50.41 0 0 1 1.29 6.83zm2.29.5c0 .13.42.21.59.25s.25-.33.12-2.66a15.59 15.59 0 0 0 -.62-4.42c-.21-.21-1-.17-1-.17a24.53 24.53 0 0 1 .58 3c.28 1.75.32 3.88.36 4zm9 3.42a10.07 10.07 0 0 0 4.08-3.79c0-.21-.08-.42-.33-.38s-1.29 1.34-3.75 3a7.32 7.32 0 0 1 -4.37 1.29 1.64 1.64 0 0 0 .12.88 7.82 7.82 0 0 0 4.24-1zm-1.13 3.65c3-.55 4.2-2.25 4.29-2.5s.08-.67-.09-.67a22 22 0 0 1 -3.2 1.83c-1.84.75-4.39.39-4.55.54a3.55 3.55 0 0 0 -.29 1.13c.04.27.88.23 3.84-.33zm-1.59 2.41c-1.25 0-1.58-.16-1.71-.25s-.41.79-.29 1 0 0 .75.17a6.71 6.71 0 0 0 2.42-.25c.25-.09.29-.67.33-.79s-.25.1-1.5.14zm-5.41 2.59c0 .2.7 2.12 3.5 3.95s8.62 1.67 9.16 1.63.54-.71.54-.92-.29.09-1.87.09a21.45 21.45 0 0 1 -7.25-1.63c-1.92-1-3.33-3.83-3.33-3.83s-.71.52-.75.71zm1 4.41a17.84 17.84 0 0 1 -3.38-4.37 1.54 1.54 0 0 0 -.75 0c-.21.12.38 2.21 3.13 4.75a9.18 9.18 0 0 0 6.08 2.71c.46-.09.21-.29.17-.54s-2.92-.49-5.21-2.53zm-3.17.5a11.13 11.13 0 0 1 -2.33-4.54s-.65-.52-.84-.29-.08 1.33 1.25 3.58a9.22 9.22 0 0 0 3.25 3.5c.38.13.5 0 .59-.16s-.13-.15-1.91-2.07zm-4.42-4.46c.05-.12-.7-.29-.7-.16a10.14 10.14 0 0 0 .7 4.58c.21.25 1 .29 1.13.08s-.54-.83-.88-1.91a7.57 7.57 0 0 1 -.21-2.57zm-1.5-.37s-.48-.91-.75-.83-.66 1.95-.91 3.12a13.43 13.43 0 0 0 .41 7.21c1.13 3.71 5 8.71 5 8.71s.34-.13.38-.42-3-4.79-4.58-8.5.49-9.27.49-9.27zm-1.7-2.42s-.29-.57-.5-.5c-.38.13-1.75 2.75-2.3 7.63s2.3 10.79 2.5 10.91.71.25.8 0-2.09-4.25-2.5-9.16a15.91 15.91 0 0 1 2.04-8.86zm-4.37 5.11a11.77 11.77 0 0 1 2.67-6.42s-.09-.56-.29-.5c-.59.17-2.67 3-3.17 5.5a24 24 0 0 0 .12 7.08c.13.21.67.21.8.13a34.15 34.15 0 0 1 -.13-5.79zm-1.54-5c-.21.16-1.75 2.54-1.83 2.66s.37.25.62.3 1.58-2.71 1.58-2.71-.13-.38-.34-.21zm3.33-3.59c-.16-.12-4.21 1.55-8.16 4.3a21.72 21.72 0 0 0 -6.21 7.12s.62.46.87.42 1.64-3.42 4.59-6 8.75-5.09 8.91-5.17.21-.5.03-.63zm-12.18 5.75a24.07 24.07 0 0 1 5.17-4.83c2.83-2 7.38-2.67 7.38-2.67s.12-.54 0-.66a17.94 17.94 0 0 0 -7.46 2.45 25 25 0 0 0 -6 5.42s.5.75.5.75a1.26 1.26 0 0 0 .41-.46zm11.21-10.62c-1.41.12-4.17.41-4.33.46s-.29.95-.29 1.08.46-.08 2-.5a15.94 15.94 0 0 1 4.29-.17 1.14 1.14 0 0 0 .21-.5c0-.21-.46-.5-1.88-.37zm-6-1.25c0-.21-1.33-.71-3.83-.42a33.79 33.79 0 0 0 -4.25.75s-.25.71-.21.88 1.47-.27 3.47-.63a15.78 15.78 0 0 1 4.71.17c.15 0 .2-.54.15-.75zm-1.45-2.25a28.64 28.64 0 0 1 6.63.19c4.17.5 5.33 2.33 5.33 2.33l.88-.38s-1-1.95-5.42-2.91a19.11 19.11 0 0 0 -8.62 0c-.38.17-1 .7-.84.75a18.79 18.79 0 0 0 2.08.02zm13.63 1.41h.5s.38-.62-1.33-2.29a7.11 7.11 0 0 0 -4.17-1.93 6.06 6.06 0 0 0 -1.67.54s1 .21 3.17.71 3.5 2.97 3.5 2.97zm-22.51-9.08c.33.08 1.54-.67 4.08-1.21a8.62 8.62 0 0 1 4.92.59 1.38 1.38 0 0 0 .25-.71c0-.38-2.42-1.5-5.17-1.17s-4.69 1.36-4.57 1.46.16.96.49 1.04zm2.51-7.08s0 1.5.25 1.54.83-1.17.83-1.17 1.46 1.21 1.71.92-.5-1.67-.46-1.88.46-.83.21-1.25-.87.09-.87.09-.79-2-1.09-2-.17 1.92-.29 2-2 .41-2 .62 1.71 1.13 1.71 1.13zm43.2 24.75.5.75a13.58 13.58 0 0 0 1.75-1.79 11.69 11.69 0 0 0 2.12-4.13c.09-.17-.76-.53-.91-.46-.42.21-.92 1.67-1.38 3a7.36 7.36 0 0 1 -2.08 2.63zm-4.5-25c.21 0 0 2.17.37 2.29s.93-1.1 1.09-1.25 1 .17 1 .17l.16-1.3s.42-.54.38-.79-1-.29-1.17-.25-.87-1.68-1.33-1.62-.38 1.46-.46 1.62-1.57-.13-1.63.13c-.11.58 1.38 1.04 1.59 1.04zm-8.29 3c1.66 2.38 1.7 6.54 1.75 6.83s.29.25.62.09.5-2.5-.75-5.92a11.32 11.32 0 0 0 -4.58-5.58 2.91 2.91 0 0 0 -.88.41 26.35 26.35 0 0 1 3.84 4.25zm-32 44.42c-.42 0-.63 1.33-.71 1.54l-1.7.54a1.09 1.09 0 0 0 .17.79c.25.25 1.21.21 1.21.21s0 1.29.29 1.41 1-.7 1.16-.87 1.34.37 1.46.17-.29-.92-.25-1.13.67-.58.63-.75-1.17-.17-1.34-.21-.47-1.58-.88-1.62zm44.16-3c-.12-.25-4 .29-6.5 0s-4.76-1.6-4.91-1.5a1.27 1.27 0 0 0 -.5 1.21c.08.58 2.16.83 4.91 1.29a23.77 23.77 0 0 0 7 0 1.25 1.25 0 0 0 .04-.92zm-.79 3.16c-2 .67-2.33 2.8-1.12 3.63s3.91.5 4-1.5a2.11 2.11 0 0 0 -2.84-2.05zm2.22 2.54c-.13.75-1.71 1.13-2.46.71s-.71-1.75.79-2.33c1.02-.42 1.74.87 1.67 1.62zm4.75-6.79a.56.56 0 0 0 .08-.75 1.56 1.56 0 0 0 -1-.25c-.21 0-.58-1.42-1-1.46s-.58 1.59-.63 1.84-1.2-.07-1.2.12c0 .54 1.16.88 1.16.88s-.37 1.33-.12 1.62 1-.46 1-.46.58.34.92.17-.38-1.29-.38-1.42.91-.16 1.12-.29zm-41.21 3c-2.17-3.5-.33-7.13-.29-7.33s-.53-.45-.67-.3c-1.17 1.3-1.58 4.5-.58 7s4.25 6 4.62 5.92.75-.33.63-.75-1.59-1.08-3.76-4.58zm19.33-.25c-4-2.29-5.25-7.42-5.08-7.58s1.25.83 3.62 1.41a26.86 26.86 0 0 0 13.8-.75c5.5-1.91 9.12-6.54 9.29-7.12s.25-2.17-.29-2.34-4.21.92-7.21 1.05-5.25-.42-5.21-.63a15.6 15.6 0 0 0 3.83-3.08c2.5-2.67 3.55-5.46 4-11.38s-.62-10.47-1.38-11.33-2.17-.08-2.42.38a24.74 24.74 0 0 1 -2.62 7.2 10.66 10.66 0 0 1 -6.2 4.46 19.8 19.8 0 0 0 -1.79-7.87c-2-4.63-6.84-8.09-13.13-9.13s-9.91.44-10.12.5c-.92.25-.55 1.29-.34 1.71s.5.17 1 .17.75-.34 4 .62 5 7.38 5 7.38a40.13 40.13 0 0 0 -5.37.33 27.14 27.14 0 0 0 -10.55 3.83c-5.12 3.13-6.5 10.42-6.5 10.8s1.21 1 1.46 1.08.5-.58 2.59-2.75a7.92 7.92 0 0 1 5.41-2.13h1.04a22.83 22.83 0 0 0 -3.09 3.34 24.67 24.67 0 0 0 -3.37 10.79c-.17 4.46 3.42 8.62 3.67 8.83s1.08 0 1.29-.29.08-1.12 0-1.83a9.13 9.13 0 0 1 1.66-5.38 13.25 13.25 0 0 1 4.55-3.08 21 21 0 0 0 .95 7.08c1.13 2.82 4.42 7.29 10.84 9.82s12 .8 12.62.38a1.51 1.51 0 0 0 .75-1.54c-.12-.49-2.75-.7-6.75-2.99zm2 3.71c-.17.16-6.58.12-10.83-2.54s-7.13-8.17-7.5-9.46-.54-5.13-.68-5.6-1.33-.8-2-.46-4.41 1.93-5.86 4.68-1.46 3.21-1.46 3.21a11.44 11.44 0 0 1 -1.17-8.37 21 21 0 0 1 6-9.71c1.3-.92 2.34-1.5 2.3-1.67a7.89 7.89 0 0 0 -4.75-1 19.63 19.63 0 0 0 -5.46 1.71 8.37 8.37 0 0 1 -1.63.88s2-3.88 3.92-5.42a24.76 24.76 0 0 1 11-4.46 43.91 43.91 0 0 1 6.79-.54.94.94 0 0 0 .37-.33s-.33-3.67-2.08-5.88a31.73 31.73 0 0 0 -3.83-3.92c.25-.08 8.75 0 12.63 4.42s4.37 10.38 4.44 11.17 0 1.66.38 1.79 2.41 0 5-1.67a12 12 0 0 0 4.25-4.29c1.08-1.62 2.25-4.75 2.62-4.83s1.68 6.16-.32 12.69-5.59 8.72-6.68 9-1.58.16-1.79.45.33 1.34.58 1.42-.08.92 4.88 1 7.83-.62 7.92-.37-2 3.71-6 5.16-9 2-11.09 1.67a37.7 37.7 0 0 1 -6.58-2c-.67-.33-1.33-.71-1.75-.46s-1.37 3.38.79 6.59a28.43 28.43 0 0 0 6.54 6.33c.71.52 1.18.6.96.77zm-7.42-31.6c-3.25.84-3.93 4.54-3.29 6.92 1 3.75 9.37 4.46 9.91-1.29s-3.56-6.44-6.62-5.63zm5 5.24c-.37 3.88-5.66 3.56-6.53 1.31s-.55-4.33 2.29-5.09c2.05-.58 4.59-.13 4.23 3.75z" fill="#1d1d1b"/></svg>
                                </div>
                            </div>
                            <div className="w-auto p-2">
                                <h5 className="text-lg text-gray-300 leading-5 font-semibold">Potential Leaking Listeners</h5>
                                <div className="flex flex-wrap items-center -m-1">
                                <div className="w-auto p-1">
                                    <span className="text-3xl leading-none text-[#c1fb41] font-semibold">{totals?.totalEventListeners}</span>
                                </div>
                                <div className="w-auto p-1">
                                    <span className="relative bottom-0.5 inline-block py-1 px-2 text-xs text-green-500 font-medium bg-teal-900 rounded-full">EL</span>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full sm:w-1/2 xl:w-1/4 px-3 mb-6">
                        <div className="max-w-xs md:max-w-none mx-auto p-6 #242525 rounded-xl">
                            <div className="flex flex-wrap items-center -m-2">
                            <div className="w-auto p-2">
                                <div className="flex flex-shrink-0 w-12 h-12 items-center justify-center bg-blue-300 bg-opacity-50 text-blue-500 rounded-xl">
                                    <svg width="90%" height="auto" viewBox="0 -9 160 160" xmlns="http://www.w3.org/2000/svg"><path d="M151.755 101.493C150.428 101.534 149.068 101.522 147.753 101.513C147.241 101.509 146.728 101.505 146.214 101.504C146.181 101.018 146.148 100.568 146.118 100.14C146.045 99.1299 145.982 98.2571 145.956 97.3856C145.892 95.1513 145.822 92.9178 145.745 90.6842C145.55 84.6713 145.342 78.4546 145.333 72.3421C145.325 68.015 145.156 67.4568 140.787 67.2614C140.225 67.2366 139.661 67.2262 139.1 67.2138C136.79 67.2177 134.48 67.2177 132.171 67.2138C117.339 67.2099 101.991 67.2047 86.9262 68.5394C86.2719 68.585 85.6151 68.5934 84.9602 68.5648C84.738 68.5595 84.5138 68.5543 84.2864 68.5511L82.5498 38.8572C82.8195 38.8384 83.0835 38.8182 83.3435 38.7986C84.1163 38.74 84.8422 38.6853 85.5714 38.6749C86.614 38.6599 87.6482 38.6631 88.6856 38.6657C90.1909 38.6703 91.7437 38.6749 93.2738 38.6221C97.3602 38.4821 98.8433 37.1187 98.943 33.415C99.2167 22.993 99.2441 14.3916 99.0317 6.35551C98.9737 4.18513 98.4413 2.66677 97.4026 1.71446C96.257 0.663788 94.4663 0.24886 91.775 0.411704C84.1072 0.867669 76.5358 1.38879 69.4368 1.88839L68.7448 1.93658C66.6361 2.03784 64.5362 2.26908 62.4563 2.62898C60.5835 2.99375 59.5637 4.29782 59.5839 6.2995C59.6223 10.0436 59.6243 13.8522 59.6263 17.5344C59.6263 22.3937 59.6315 27.4191 59.7188 32.3611C59.8041 37.1813 60.6832 37.744 65.1313 38.4638C65.9155 38.5817 66.7058 38.6556 67.4982 38.6853C69.8258 38.7921 72.1535 38.8885 74.5405 38.9875L76.9333 39.0872V68.9152C76.7163 68.9471 76.5006 68.9803 76.2816 69.0155C75.6398 69.1308 74.9914 69.2096 74.3404 69.2513C58.9785 69.9405 43.617 70.6159 28.2557 71.2777C26.9811 71.3331 25.7058 71.3637 24.4306 71.395C23.3671 71.421 22.303 71.4464 21.2375 71.4868C18.8538 71.5761 17.5108 72.0164 16.7503 72.9609C16.0114 73.8774 15.8602 75.2798 16.259 77.5075C16.3509 78.0221 16.4545 78.536 16.5594 79.0487C16.7399 79.9365 16.9263 80.8543 17.0416 81.7603C17.9238 88.4851 18.1536 95.279 17.7278 102.048C16.7125 102.048 15.7123 102.046 14.727 102.043C12.2873 102.038 9.92116 102.032 7.55441 102.055C3.91305 102.092 2.40125 103.437 1.97768 107.02C0.919127 116.238 0.880202 125.546 1.86167 134.773C2.13341 137.411 3.30052 138.645 5.89078 139.033C7.23858 139.207 8.60009 139.251 9.95635 139.163C14.3119 138.962 18.6673 138.753 23.0224 138.534C27.6855 138.303 32.3484 138.08 37.0111 137.862C39.5975 137.744 41.4175 137.049 42.5748 135.737C43.7321 134.425 44.1889 132.546 43.9837 129.986C43.7771 127.408 43.4702 124.02 42.9293 120.668C42.0339 115.115 41.1314 110.166 40.1709 105.537C39.5388 102.486 38.1723 101.354 35.2797 101.508C32.9012 101.633 30.4876 101.605 28.1508 101.577C27.2476 101.566 26.349 101.555 25.4588 101.553L22.6529 77.3421L78.0124 75.7312V99.9624C77.5295 99.9943 77.074 100.028 76.6387 100.056C75.5616 100.13 74.6069 100.196 73.651 100.236C72.145 100.301 70.6384 100.356 69.1319 100.412C66.4517 100.512 63.6801 100.614 60.9549 100.768C59.6145 100.844 58.5726 101.388 58.1666 102.225C58.0188 102.552 57.9649 102.914 58.0109 103.271C58.0569 103.628 58.2011 103.964 58.4272 104.244C59.4607 105.721 59.4295 107.225 59.3962 108.818C59.3891 109.144 59.3819 109.478 59.3845 109.809C59.4014 112.088 59.3943 114.368 59.3845 116.648C59.3721 120.656 59.3591 124.8 59.4835 128.875C59.5997 130.634 59.8937 132.377 60.3613 134.077C60.5203 134.74 60.6793 135.403 60.8175 136.066C61.4965 139.343 64.2379 140.046 66.2399 140.29C66.9932 140.365 67.751 140.391 68.5082 140.368C68.7689 140.368 69.0256 140.364 69.2869 140.368L70.3211 140.374C79.1169 140.434 87.914 140.489 96.7125 140.539C97.6241 140.559 98.5364 140.5 99.4383 140.36C101.177 140.059 102.41 139.344 103.102 138.235C103.807 137.108 103.907 135.649 103.399 133.898C103.149 132.875 103.033 131.824 103.056 130.772C103.009 128.115 102.987 125.457 102.966 122.799C102.921 117.313 102.876 111.641 102.59 106.07C102.32 100.813 100.295 99.9715 95.5298 100.008C93.277 100.022 91.0256 100.019 88.6133 100.015H85.4202L83.971 75.0166L140.012 73.5791L138.774 101.388H136.645C135.006 101.384 133.505 101.38 132.006 101.395C130.994 101.407 129.98 101.405 128.972 101.406C126.33 101.401 123.62 101.406 120.953 101.608C117.488 101.874 116.423 103.123 116.572 106.748C116.694 109.723 116.813 111.989 116.959 114.096C117.07 115.698 117.179 117.301 117.285 118.905C117.598 123.668 117.923 128.593 118.399 133.424C118.886 138.364 121.032 140.376 126.05 140.6L131.612 140.849C138.443 141.156 145.274 141.454 152.106 141.743C152.271 141.749 152.436 141.753 152.601 141.753C153.466 141.757 154.329 141.658 155.171 141.46C157.299 140.939 158.458 139.831 158.616 138.156C158.954 134.574 159.184 131.006 159.297 127.554C159.379 125.087 159.368 122.579 159.357 120.154C159.352 119.054 159.347 117.953 159.351 116.853C159.354 115.951 159.375 115.049 159.395 114.145C159.44 112.176 159.486 110.141 159.343 108.144C158.999 103.391 156.657 101.347 151.755 101.493ZM64.3585 106.127H95.288V133.871L66.0633 134.79L64.3585 106.127ZM7.07152 107.238H33.072C33.3789 109.452 33.7607 111.71 34.1302 113.898C35.0471 119.325 35.9946 124.935 36.0337 130.899L8.19562 132.577C6.83044 125.276 6.49221 117.66 7.07152 107.238ZM92.8443 8.41583C92.6612 14.5765 92.4631 20.7373 92.2579 27.0452L92.1073 31.7351L91.9118 31.7488C83.277 32.3552 74.3482 32.9864 65.4389 32.8959L64.2216 6.5568H92.6684C92.6906 6.747 92.714 6.92743 92.7336 7.0994C92.8053 7.53458 92.8424 7.97478 92.8443 8.41583ZM151.895 107.936V134.023H124.947L121.858 106.527C131.891 106.289 141.928 106.76 151.895 107.936Z" fill="#000000"/></svg>
                                </div>
                            </div>
                            <div className="w-auto p-2">
                                <h5 className="text-lg text-gray-300 leading-5 font-semibold">Potential Leaking DOM Nodes</h5>
                                <div className="flex flex-wrap items-center -m-1">
                                <div className="w-auto p-1">
                                    <span className="text-3xl leading-none text-[#c1fb41] font-semibold">{totals?.totalDomNodes}</span>
                                </div>
                                <div className="w-auto p-1">
                                    <span className="relative bottom-0.5 inline-block py-1 px-2 text-xs text-green-500 font-medium bg-teal-900 rounded-full">DN</span>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full sm:w-1/2 xl:w-1/4 px-3 mb-6">
                        <div className="max-w-xs md:max-w-none mx-auto p-6 #242525 rounded-xl">
                            <div className="flex flex-wrap items-center -m-2">
                            <div className="w-auto p-2">
                                <div className="flex flex-shrink-0 w-12 h-12 items-center justify-center bg-blue-300 bg-opacity-50 text-blue-500 rounded-xl">
                                    <svg width="90%" height="auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15 5H20V15C20 16.8856 20 17.8284 19.4142 18.4142C18.8284 19 17.8856 19 16 19H15" stroke="#222222"/> <path d="M9 5H6C4.89543 5 4 5.89543 4 7V19H9" stroke="#222222"/></svg>
                                </div>
                            </div>
                            <div className="w-auto p-2">
                                <h5 className="text-lg text-gray-300 leading-5 font-semibold">Potential Leaking Collections</h5>
                                <div className="flex flex-wrap items-center -m-1">
                                <div className="w-auto p-1">
                                    <span className="text-3xl leading-none text-[#c1fb41] font-semibold">{totals?.totalCollections}</span>
                                </div>
                                <div className="w-auto p-1">
                                    <span className="relative bottom-0.5 inline-block py-1 px-2 text-xs text-green-500 font-medium bg-teal-900 rounded-full">C</span>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full sm:w-1/2 xl:w-1/4 px-3 mb-6">
                        <div className="max-w-xs md:max-w-none mx-auto p-6 #242525 rounded-xl">
                            <div className="flex flex-wrap items-center -m-2">
                            <div className="w-auto p-2">
                                <div className="flex flex-shrink-0 w-12 h-12 items-center justify-center bg-blue-300 bg-opacity-50 text-blue-500 rounded-xl">
                                <svg width="100%" height="auto" viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" enable-background="new 0 0 76.00 76.00" xml:space="preserve" fill="#ffffff" stroke="#ffffff">

                                    <g id="SVGRepo_bgCarrier" stroke-width="0"/>

                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

                                    <g id="SVGRepo_iconCarrier"> <path fill="#" fill-opacity="1" stroke-width="0.2" stroke-linejoin="round" d="M 18,21.7037L 43.9259,18L 58,25.4074L 58,54.2963L 32.8148,58L 18,49.1111L 18,21.7037 Z "/> </g>

                                    </svg>
                                </div>
                            </div>
                            <div className="w-auto p-2">
                                <h5 className="text-lg text-gray-300 leading-5 font-semibold">Potential Leaking Objects</h5>
                                <div className="flex flex-wrap items-center -m-1">
                                <div className="w-auto p-1">
                                    <span className="text-3xl leading-none text-[#c1fb41] font-semibold">{totals?.totalObjects}</span>
                                </div>
                                <div className="w-auto p-1">
                                    <span className="relative bottom-0.5 inline-block py-1 px-2 text-xs text-green-500 font-medium bg-teal-900 rounded-full">O</span>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                </div>
                </div>
            </div>
        </section>
    )};

export default Overview;