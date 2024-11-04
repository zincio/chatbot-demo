'use client';

import cx from 'classnames';
import { format, isWithinInterval } from 'date-fns';
import { useEffect, useState } from 'react';
import { Rating } from 'react-simple-star-rating';

interface SearchResult {
  index: string;
  product_id: string;
  title: string | null;
  brand: string | null | undefined;
  price: number | null;
  image: string | null;
  num_sales: number | null | undefined;
  num_reviews: number | null | undefined;
  stars: number | null | undefined;
  prime: boolean | null | undefined;
}

const SAMPLE = [
  {
    "index": "#1",
    "product_id": "B09WH84T1J",
    "title": "hash bubbie Women's Slip on Shoes Canvas Sneakers Loafers Non Slip Shoes Low Top Casual Shoes",
    "image": "https://m.media-amazon.com/images/I/61KpR5cD48L._AC_UL320_.jpg",
    "brand": "hash bubbie",
    "price": 1999,
    "num_offers_estimate": null,
    "num_reviews": 16305,
    "stars": 4.0,
    "num_sales": 400,
    "prime": true,
  },
  {
    "index": "#2",
    "product_id": "B0B75F5F25",
    "title": "TUOPIN Womens White Canvas Sneakers Low Top Lace-up Canvas Shoes Lightweight Casual Tennis Shoes",
    "image": "https://m.media-amazon.com/images/I/61nKU1q2oZL._AC_UL320_.jpg",
    "brand": "TUOPIN",
    "price": 2099,
    "num_offers_estimate": null,
    "num_reviews": 2312,
    "stars": 4.1,
    "num_sales": 400,
    "product_details": [],
    "fresh": false,
    "prime": true,
    "pantry": false,
    "addon": false
  },
];

export function SearchResults({ results = SAMPLE }: { results?: SearchResult[] }) {

  /*const [isMobile, setIsMobile] = useState(false);
"
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);*/

  return results.map((result:SearchResult)=>(
    <div
      key={result.index}
      className={cx(
        'flex flex-col gap-4 rounded-2xl p-4 skeleton-bg max-w-[500px] bg-blue-400 mb-4',
      )}
    >
      <div className="flex flex-row justify-start items-center">
        <div className="flex flex-row gap-2 items-center">
          <div className="text-4xl font-medium text-blue-50">
            {result.index}
          </div>
          { result.price ?
          <div className="h-full text-2xl font-medium text-green-50">
            ${Math.ceil(result.price/100)}
          </div> : ""
          }
          <div className="w-1/5 h-full">
            <img className="object-contain" src={result.image || ""} alt="product image" />
          </div>
          <div className="text-l font-medium text-blue-50">
            {result.title}
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-start items-center">
        <div className="">
          <Rating SVGclassName={'inline-block'} initialValue={result.stars || undefined} readonly={true} allowFraction={true} />
        </div>
        <div className="text-l">
          {result.num_reviews} reviews
          { result.num_sales ? ` - ${result.num_sales} sales` : "" }
        </div>
      </div>
    </div>
  ));
}
