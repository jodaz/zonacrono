import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { eventService } from '@/features/events';
import { akomoService } from '@/features/akomo';
import { EventHubTemplate } from "@/components/events";
import { TenantData } from "@/types";
import { Loader2 } from 'lucide-react';

interface EventPageProps {
  params: Promise<{ event: string }>;
}

/**
 * Generate dynamic metadata for the event page
 */
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { event: eventSlug } = await params;
  const event = await eventService.getEventBySlug(eventSlug);
  if (!event) {
    return {
      title: 'Evento no encontrado',
    };
  }

  return {
    title: event?.organization?.name 
      ? `${event.name} | Organizado por ${event.organization.name}`
      : event.name,
    description: event.description || `Inscríbete en ${event.name} a través de ZonaCrono.`,
    openGraph: {
      title: event.name,
      description: event.description || '',
      images: event.banner_url ? [event.banner_url] : [],
    },
  };
}

/**
 * Loading state for the event hub
 */
function EventLoading() {
  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center gap-4 text-white">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
        Cargando Evento...
      </p>
    </div>
  );
}

/**
 * Main Event Page (Server Component)
 */
export default async function EventPage({ params }: EventPageProps) {
  const { event: eventSlug } = await params;
  
  // Fetch event data and exchange rate in parallel on the server
  const [event, bcvRate] = await Promise.all([
    eventService.getEventBySlug(eventSlug),
    akomoService.getExchangeRate()
  ]);

  if (!event) {
    return notFound();
  }

  // Map database event to TenantData structure
  const mappedData: TenantData = {
    id: event.slug,
    name: event.name,
    title: event.name,
    description: event.description || '',
    heroImage: event.banner_url || 'https://images.unsplash.com/photo-1530549387074-d76f964b3489?q=80&w=2072&auto=format&fit=crop',
    logo: event.logo_url || '/logo.png',
    primaryColor: '#6d28d9', // Standard purple
    registrationLink: `/${event.slug}/inscripciones`,
    eventDate: event.event_date || '',
    eventTime: event.event_time || undefined,
    city: event.city || "Venezuela",
    pricingStages: event.registration_stages?.map((stage: any) => ({
      id: stage.id,
      name: stage.name,
      priceUsd: stage.price_usd,
      isActive: stage.is_active,
      spotsLeft: (stage.total_capacity || 0) - (stage.used_capacity || 0)
    })) || [],
    rules: event.rules_text ? [
      { id: 'rules', title: 'Reglamento', content: event.rules_text }
    ] : undefined,
    eventDetails: {
      route: {
        title: "Ruta del Evento",
        description: event.route_description || "Mapa oficial de la ruta.",
        image: event.route_image_url || '',
        stravaLinks: event.strava_url ? [{ 
          label: "Segmento Strava", 
          url: /^\d+$/.test(event.strava_url.trim()) 
            ? `https://www.strava.com/routes/${event.strava_url.trim()}` 
            : event.strava_url.trim() 
        }] : []
      },
      categories: event.categories?.map((cat: any) => ({
        name: cat.name,
        range: `${cat.min_age}-${cat.max_age}`,
        description: cat.description || "",
        gender: cat.gender
      })) || []
    },
    metadata: {
      keywords: ["deportes", "carrera", event.name.toLowerCase()],
      ogImage: event.banner_url || '',
      ogTitle: event.name,
      ogDescription: event.description || ''
    },
    organization: event.organization ? {
      name: event.organization.name,
      logo_url: event.organization.logo_url ?? undefined,
      email: event.organization.email ?? undefined,
      phone: event.organization.phone ?? undefined,
    } : undefined,
    social_media: event.social_media ? {
      instagram: (event.social_media as any).instagram,
      facebook: (event.social_media as any).facebook,
      twitter: (event.social_media as any).twitter,
      threads: (event.social_media as any).threads,
      tiktok: (event.social_media as any).tiktok,
    } : undefined
  };

  return (
    <Suspense fallback={<EventLoading />}>
      <EventHubTemplate tenant={mappedData} bcvRate={bcvRate} />
    </Suspense>
  );
}
