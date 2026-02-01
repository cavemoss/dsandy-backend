export interface ProductSCU {
  id: number;

  propertyId: number;
  propertyName: string;
  propertyValueId: number;
  propertyValueName: string;

  combinations: {
    propertyId: number;
    propertyName: string;
    propertyValueId: number;
    propertyValueName: string;
  }[];
  combinationString: string;

  priceInfo: {
    currency: string;
    price: string;
    offerPrice: string;
    offerBulkPrice: string;
    dsPrice: number;
    dsOfferPrice: number;
    dsDiscount: string | null;
  };

  availableStock: number;
  image: string;
}

export interface Product {
  id: number;
  aliProductId: number;
  subdomainName: string;
  title: string | null;
  aliName: string;
  logistics: {
    deliveryTime: number;
    shipTo: string;
  };
  feedback: {
    reviewsCount: number;
    salesCount: string;
    rating: number;
  };
  images: string[];
  specifications: [string, string][];
  descriptionHtml: string;
  scus: ProductSCU[];
  scuLayers: number;
  categoryIds: number[];
}

export interface ProductReviews {
  pages: {
    current: number;
    total: number;
    size: number;
  };
  overview: {
    rating: number;
    count: number;
    stats: {
      [K in 1 | 2 | 3 | 4 | 5]: number;
    };
  };
  list: {
    name: string;
    date: string;
    rating: number;
    text: string;
    attr: string;
    thumbnails?: string[];
    images?: string[];
  }[];
}
