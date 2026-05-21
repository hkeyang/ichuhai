import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { productImage, productUrl, seoProducts, siteConfig } from "@/lib/seo/products";
import { InteractiveAppScript, JsonLd, ProductPageContent, ToastRegion } from "../../seo-components";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seoProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = seoProducts.find((item) => item.slug === slug);
  if (!product) return {};

  return {
    title: {
      absolute: product.seo.title,
    },
    description: product.seo.description,
    keywords: product.seo.keywords,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      url: productUrl(product.slug),
      type: "website",
      images: [productImage(product)],
    },
    twitter: {
      card: "summary_large_image",
      title: product.seo.title,
      description: product.seo.description,
      images: [productImage(product)],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = seoProducts.find((item) => item.slug === slug);
  if (!product) notFound();

  return (
    <>
      <JsonLd
        id="product-breadcrumb-jsonld"
        data={breadcrumbJsonLd([
          { name: "首页", url: siteConfig.url },
          { name: "商品", url: `${siteConfig.url}/products` },
          { name: product.name, url: productUrl(product.slug) },
        ])}
      />
      <JsonLd id="product-jsonld" data={productJsonLd(product)} />
      <div id="app">
        <ProductPageContent product={product} />
      </div>
      <ToastRegion />
      <InteractiveAppScript />
    </>
  );
}
