'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store';
import { cn, formatEventDate } from '@/lib';
import { useAdminEvents } from '@/hooks/queries/useEvents';
import { CreateEventDialog } from '@/components/dashboard/create-event-dialog';
import { 
  ExternalLink, 
  Settings, 
  Calendar,
  Clock,
  Search,
  Globe,
  Activity,
  Users,
  MapPin,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDashboardStats } from '@/hooks/queries/useDashboardStats';

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface Event {
  id: string;
  name: string;
  slug: string;
  description: string;
  social_media?: any;
  event_date: string;
  event_time: string;
  manager_id: string;
  managers: Manager;
  created_at: string;
  status?: string;
}

export default function EventsPage() {
  const router = useRouter();
  
  // React Query Hooks
  const { data: adminData, isLoading: isEventsLoading } = useAdminEvents();
  const { data: statsData, isLoading: isStatsLoading } = useDashboardStats();
  const { role } = useAuthStore();
  
  const events = adminData?.events || [];
  const managers = adminData?.managers || [];
  
  // Local UI State
  const [search, setSearch] = useState("");

  const filteredEvents = events.filter((event: Event) => 
    event.name.toLowerCase().includes(search.toLowerCase()) || 
    event.managers?.name.toLowerCase().includes(search.toLowerCase())
  );

  const openConfigPage = (event: Event) => {
    router.push(`/dashboard/events/${event.id}/configs?tab=general`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-satoshi text-4xl font-black uppercase tracking-tight italic text-foreground">
            Gestión de <span className="text-primary">Eventos</span>
          </h1>
          <p className="text-muted-foreground font-medium italic">
            Panel de control para todos los eventos de la plataforma.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar evento..." 
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-9 h-11 rounded-none border-2 border-black focus-visible:ring-primary/20 bg-white"
            />
          </div>
          
          {role === 'superadmin' && (
            <CreateEventDialog managers={managers} />
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isStatsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/20 animate-pulse border-2 border-dashed border-black/10 dark:border-white/10" />
          ))
        ) : (
          (role === 'superadmin' ? [
            { label: "Inscripciones Totales", value: statsData?.stats?.registrations_total || "0", icon: Users, color: "border-primary" },
            { label: "Eventos Totales", value: statsData?.stats?.events_total || "0", icon: Globe, color: "border-blue-500" },
            { label: "Estado de Sincronización", value: statsData?.stats?.sync_status || "OK", icon: Activity, color: "border-green-500" },
            { label: "Logs de Plataforma", value: "Activo", icon: Activity, color: "border-orange-500" },
          ] : [
            { label: "Recaudación Estimada", value: `$${(statsData?.stats?.revenue_estimated || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "border-green-600" },
            { label: "Inscripciones Totales", value: statsData?.stats?.registrations_total || "0", icon: Users, color: "border-primary" },
            { label: "Pagos Pendientes", value: statsData?.stats?.pending_payments || "0", icon: Clock, color: (statsData?.stats?.pending_payments || 0) > 0 ? "border-destructive animate-pulse" : "border-muted" },
            { label: "Etapa Actual", value: statsData?.stats?.current_stage || "N/A", icon: MapPin, color: "border-orange-500" },
          ]).map((stat, i) => {
            const isComingSoon = stat.label === "Estado de Sincronización" || stat.label === "Logs de Plataforma" || stat.label === "Tasa de Conversión";
            
            return (
              <div key={i} className={`bg-card border-2 ${stat.color} p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] group hover:translate-x-1 transition-transform relative overflow-hidden`}>
                {isComingSoon && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-0.5 border border-amber-500/20 rounded-none">
                    <AlertTriangle className="size-2" />
                    <span className="font-mono text-[7px] font-black uppercase tracking-widest">PRÓXIMAMENTE</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <div className={cn(
                  "font-satoshi text-3xl font-black italic uppercase tracking-tighter truncate",
                  isComingSoon && "blur-[2px] opacity-40 grayscale"
                )}>
                  {stat.value}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Table */}
      <div className="bg-card border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b-2 border-black dark:border-white">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase tracking-widest py-5">Evento</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest py-5">URL</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest py-5">Organizador</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest py-5">Fecha / Hora</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEventsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-black/5">
                  <TableCell colSpan={5} className="py-6">
                    <div className="h-8 w-full bg-muted/20 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center font-medium italic text-muted-foreground">
                  No se encontraron eventos globales.
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event: Event) => (
                <TableRow key={event.id} className="hover:bg-muted/30 transition-colors border-b border-black/5 last:border-0">
                  <TableCell className="font-black italic text-lg py-5">{event.name}</TableCell>
                  <TableCell>
                    <Link 
                      href={`/${event.slug}`} 
                      target="_blank"
                      className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      /{event.slug}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold italic text-sm">{event.managers?.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{event.managers?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 font-mono text-[11px]">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1.5 text-primary" />
                        {formatEventDate(event.event_date, 'numeric')}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1.5 text-primary" />
                        {event.event_time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openConfigPage(event)}
                      className="h-10 w-10 p-0 hover:bg-black hover:text-white rounded-none border-2 border-transparent hover:border-black"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
