import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlace } from '@/lib/repo';
import { placeNeighborhoodName } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { PlaceForm, type PlaceFormInitial } from '@/components/feature/NovoLugarForm';

export const metadata: Metadata = { title: 'Editar lugar', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function EditarLugarPage({ params }: { params: { slug: string } }) {
  const place = await getPlace(params.slug);
  if (!place) notFound();

  const initial: PlaceFormInitial = {
    slug: place.slug,
    name: place.name,
    shortDescription: place.shortDescription,
    description: place.description,
    neighborhoodName: placeNeighborhoodName(place),
    region: place.region,
    lat: place.geo.lat,
    lng: place.geo.lng,
    categories: place.categories,
    tags: place.tags,
    priceMin: place.price.min,
    priceMax: place.price.max,
    free: place.price.free,
    favorite: place.favorite,
    wantToReturn: place.wantToReturn,
    website: place.website ?? '',
    instagram: place.instagram ?? '',
    hours: place.hours?.summary ?? '',
    coverImageUrl: place.coverImage.demo ? '' : place.coverImage.url,
    recommendedMinutes: place.recommendedMinutes,
    cep: place.address.zip ?? '',
    street: place.address.street ?? '',
    rating: place.rating,
    stationName: place.nearestStations[0]?.name ?? '',
    stationType: place.nearestStations[0]?.type ?? 'metro',
    stationMinutes: place.nearestStations[0]?.walkingMinutes,
  };

  return (
    <div className="section container container-wide">
      <UrbanLabel>Editar · {place.name}</UrbanLabel>
      <h1 className="display title-lg" style={{ marginTop: '0.6rem' }}>Editar lugar</h1>
      <p className="lead" style={{ marginTop: '0.75rem', marginBottom: '2rem' }}>
        Altere os dados, reposicione o pino se precisar, e salve. Ou exclua o lugar de vez.
      </p>
      <PlaceForm initial={initial} />
    </div>
  );
}
