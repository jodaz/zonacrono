import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Calendar, 
  Dna, 
  User, 
  MapPin,
  ArrowLeft,
  Timer,
  CreditCard,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { supabaseAdmin } from '@/lib';
import { getBcvRate } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { Button, Badge, Separator, Logo } from '@/components/ui';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { ReportPaymentForm } from '@/components/events/ReportPaymentForm';

interface StatusPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate metadata for the status page
 */
export async function generateMetadata({ params }: StatusPageProps): Promise<Metadata> {
  const { id } = await params;
  const registration = await getRegistration(id);

  if (!registration) {
    return { title: 'Inscripción no encontrada' };
  }

  return {
    title: 'Estado de Inscripción',
    description: `Consulta el estado de tu inscripción para ${registration.event?.name}.`,
  };
}

async function getRegistration(id: string) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select(`
      *,
      event:events(name, slug, banner_url),
      stage:registration_stages(name, price_usd),
      category:categories(name),
      payment:payments(amount_usd, reference_number, reported_at)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}


export default async function RegistrationStatusPage({ params }: StatusPageProps) {
  const { id } = await params;
  const registration = await getRegistration(id);

  if (!registration) {
    return notFound();
  }

  const statusMap = {
    PENDING: { 
      label: 'Pendiente de Pago', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
      icon: <Clock className="w-5 h-5" />,
      description: 'Tu lugar está reservado. Reporta tu pago antes de las 11:59 PM para evitar la cancelación.'
    },
    REPORTED: { 
      label: 'Pago Reportado', 
      color: 'bg-blue-100 text-blue-800 border-blue-300', 
      icon: <FileText className="w-5 h-5" />,
      description: 'Hemos recibido tu reporte de pago. Un administrador lo validará en las próximas 24-48 horas.'
    },
    APPROVED: { 
      label: 'Inscripción Confirmada', 
      color: 'bg-green-100 text-green-800 border-green-300', 
      icon: <CheckCircle className="w-5 h-5" />,
      description: '¡Felicidades! Tu inscripción ha sido confirmada. Nos vemos en la línea de salida.'
    },
    REJECTED: { 
      label: 'Pago Rechazado', 
      color: 'bg-red-100 text-red-800 border-red-300', 
      icon: <XCircle className="w-5 h-5" />,
      description: 'Hubo un problema con tu pago. Por favor contacta al organizador.'
    },
    EXPIRED: { 
      label: 'Reserva Expirada', 
      color: 'bg-gray-100 text-gray-800 border-gray-300', 
      icon: <XCircle className="w-5 h-5" />,
      description: 'El tiempo límite para reportar el pago ha expirado.'
    }
  };

  const currentStatus = statusMap[registration.status as keyof typeof statusMap];

  // Fetch BCV rate only when needed (PENDING status)
  const bcvRate = registration.status === 'PENDING' ? await getBcvRate() : 0;
  const stagePrice = registration.stage?.price_usd ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b-4 border-black dark:border-white bg-background sticky top-0 z-50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo width={160} height={36} className="h-[35px] w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/${registration.event.slug}`}>
              <Button variant="ghost" className="font-mono text-xs uppercase font-black hover:bg-foreground hover:text-background rounded-none border-2 border-transparent hover:border-foreground transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al evento
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        {/* Status Card */}
        <div className={cn(
          "border-4 border-black dark:border-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] mb-12 flex flex-col items-center text-center gap-4 bg-card",
          registration.status === 'APPROVED' ? "bg-green-50/10" : ""
        )}>
          <div className={cn(
            "w-20 h-20 rounded-none border-4 border-black dark:border-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mb-2",
            registration.status === 'APPROVED' ? "bg-primary text-white" : "bg-card"
          )}>
            <div className="text-current [&>svg]:w-10 [&>svg]:h-10">
              {currentStatus.icon}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none text-foreground">
            {currentStatus.label}
          </h1>
          
          <p className="max-w-md font-mono text-sm font-bold text-muted-foreground uppercase leading-relaxed">
            {currentStatus.description}
          </p>

          {registration.status === 'APPROVED' && (
            <Button className="hidden mt-4 rounded-none border-4 border-black dark:border-white bg-foreground text-background hover:bg-background hover:text-foreground font-black uppercase italic tracking-widest px-8 h-14 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all">
              <Download className="mr-2 h-5 w-5" /> Descargar Comprobante
            </Button>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Athlete Info */}
          <div className="border-4 border-black dark:border-white bg-card p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="font-satoshi text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" /> Atleta
            </h3>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground font-bold">Nombre Completo</span>
                <span className="font-black text-lg text-foreground">{registration.first_name} {registration.last_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground font-bold">Documento / DNI</span>
                <span className="font-bold text-foreground">{registration.dni}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground font-bold">Email</span>
                <span className="font-bold lowercase text-foreground">{registration.email}</span>
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div className="border-4 border-black dark:border-white bg-card p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="font-satoshi text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-2 text-foreground">
              <MapPin className="w-5 h-5 text-primary" /> Evento
            </h3>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground font-bold">Competencia</span>
                <span className="font-black text-lg uppercase tracking-tight leading-tight text-foreground">{registration.event.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground font-bold">Categoría</span>
                <span className="font-bold uppercase text-foreground">{registration.category.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground font-bold">Etapa</span>
                <span className="font-bold uppercase text-foreground">{registration.stage.name}</span>
              </div>
            </div>
          </div>

          {/* Payment Info (when reported/approved) */}
          {registration.payment && (
            <div className="md:col-span-2 border-4 border-black dark:border-white bg-card p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <h3 className="font-satoshi text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-2 text-foreground">
                <CreditCard className="w-5 h-5 text-primary" /> Información de Pago
              </h3>
              <div className="grid sm:grid-cols-3 gap-6 font-mono text-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">Monto</span>
                  <span className="font-black text-xl text-primary">${registration.payment.amount_usd} USD</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">Referencia</span>
                  <span className="font-bold text-foreground">#{registration.payment.reference_number}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">Fecha Reporte</span>
                  <span className="font-bold text-foreground">{format(new Date(registration.payment.reported_at), "dd-MM-yyyy HH:mm")}</span>
                </div>
              </div>
            </div>
          )}

          {/* Report Payment Form (only for PENDING registrations) */}
          {registration.status === 'PENDING' && (
            <ReportPaymentForm
              registrationId={registration.id}
              priceUsd={stagePrice}
              bcvRate={bcvRate}
            />
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-12 text-center space-y-6">
          <Separator className="bg-foreground/10 h-1" />
          <div className="flex justify-center gap-4">
             <Link href={`/${registration.event.slug}`}>
              <Button variant="outline" className="rounded-none border-2 border-black dark:border-white font-black uppercase text-xs tracking-widest px-6 h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                Página del Evento
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

