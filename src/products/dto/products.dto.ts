export class ProductSCU {
  aliScuId: string;
  propertyId: number;
  propertyName: string;
  propertyValueId: number;
  propertyValueName: string;
  availableStock: number;
  priceInfo: {
    currency: string;
    price: string;
    offerPrice: string;
    offerBulkPrice: string;
    dsPrice: number;
    dsOfferPrice: number;
    dsDiscount: string;
  };
  image: string;
}

export class Product {
  id: number;
  aliProductId: number;
  subdomainName: string;
  name: string;
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
}
