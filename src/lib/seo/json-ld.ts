import {
  defaultSku,
  deliveryLabel,
  productImage,
  productUrl,
  seoProducts,
  siteConfig,
  type SeoProduct,
} from "./products";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.logo}`,
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function itemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ichuhai 数字商品列表",
    itemListElement: seoProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: productUrl(product.slug),
      name: product.name,
    })),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productJsonLd(product: SeoProduct) {
  const sku = defaultSku(product);
  const lowPrice = Math.min(...product.skus.map((item) => item.priceUsdt));
  const highPrice = Math.max(...product.skus.map((item) => item.priceUsdt));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seo.description,
    image: `${siteConfig.url}${productImage(product)}`,
    brand: {
      "@type": "Brand",
      name: product.name.split(" ")[0],
    },
    category: product.category,
    sku: sku?.id,
    offers: {
      "@type": "AggregateOffer",
      url: productUrl(product.slug),
      priceCurrency: "USD",
      lowPrice,
      highPrice,
      offerCount: product.skus.length,
      availability: product.skus.some((item) => item.stock !== "sold_out")
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "Worldwide",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: product.deliveryType === "manual" ? 5 : 0,
            maxValue: product.deliveryType === "manual" ? 60 : 5,
            unitCode: "MIN",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "Worldwide",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: product.notice.refundSummary.includes("不支持") ? 0 : 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "发货方式", value: deliveryLabel(product.deliveryType) },
      { "@type": "PropertyValue", name: "支付方式", value: "USDT" },
      { "@type": "PropertyValue", name: "保质期", value: product.notice.warrantySummary },
    ],
  };
}
