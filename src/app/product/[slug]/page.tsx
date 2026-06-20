import { redirect } from "next/navigation";

type LegacyProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyProductPage({ params }: LegacyProductPageProps) {
  const { slug } = await params;
  redirect(`/products/${slug}`);
}
