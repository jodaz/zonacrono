"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Layers, 
  Tag,
  Info,
  Loader2,
  ImageIcon,
  CreditCard,
  User,
  AlertTriangle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Form, 
} from "../ui/form";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { cn } from "@/lib";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryManagement } from "./category-management";
import { StageManagement } from "./stage-management";
import { RegistrationManagement } from "./registration-management";
import { useAdminEvents, useUpdateEvent } from "@/hooks/queries/useEvents";

// Sub-components
import { GeneralTab } from "./config/general-tab";
import { MediaTab } from "./config/media-tab";
import { BankDataTab } from "./config/bank-data-tab";
import { ConfigActions } from "./config/config-actions";

// --- ZOD SCHEMA ---
const configSchema = z.object({
  id: z.string().optional(),
  manager_id: z.string().min(1, 'El organizador es requerido'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  slug: z.string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener minúsculas, números y guiones'),
  description: z.string().optional(),
  event_date: z.string().min(1, 'La fecha es requerida'),
  event_time: z.string().min(1, 'La hora es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  rules_text: z.string().optional(),
  has_inventory: z.boolean(),
  logo_url: z.string().url('URL inválida').or(z.literal('')).optional(),
  banner_url: z.string().url('URL inválida').or(z.literal('')).optional(),
  route_image_url: z.string().url('URL inválida').or(z.literal('')).optional(),
  route_description: z.string().optional(),
  strava_url: z.string()
    .refine((val) => !val || /^\d+$/.test(val.trim()) || val.trim().includes('strava.com/routes/'), {
      message: 'Debe ser un ID de Strava numérico (ej. 31234567) o una URL de ruta'
    })
    .or(z.literal(''))
    .optional(),
  social_media: z.object({
    instagram: z.string().url('URL inválida').or(z.literal('')).optional(),
    facebook: z.string().url('URL inválida').or(z.literal('')).optional(),
    twitter: z.string().url('URL inválida').or(z.literal('')).optional(),
    threads: z.string().url('URL inválida').or(z.literal('')).optional(),
    tiktok: z.string().url('URL inválida').or(z.literal('')).optional(),
  }).optional(),
  payment_info: z.object({
    bank_name: z.string().min(1, 'El nombre del banco es requerido').or(z.literal('')),
    bank_code: z.string().optional().nullable(),
    account_number: z.string().min(1, 'El número de cuenta es requerido').or(z.literal('')),
    id_number: z.string().min(1, 'La cédula/RIF es requerida').or(z.literal('')),
    phone_number: z.string().min(1, 'El número de teléfono es requerido').or(z.literal('')),
  }).optional(),
  organization: z.object({
    name: z.string().min(1, 'El nombre de la organización es requerido').or(z.literal('')),
    logo_url: z.string().url('URL inválida').or(z.literal('')).optional(),
    email: z.string().email('Email inválido').or(z.literal('')).optional(),
    phone: z.string().optional(),
  }).optional(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

// Removed hardcoded stages

interface ConfigViewProps {
  eventId: string;
  onDelete?: () => void;
  onUpdate?: () => void;
  onLoaded?: (event: any) => void;
  isPage?: boolean;
}

interface Manager {
  id: string;
  name: string;
  email: string;
}

export function ConfigView({ eventId, onDelete, onUpdate, onLoaded, isPage = false }: ConfigViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // React Query Hooks
  const { data: adminData, isLoading } = useAdminEvents();
  const updateMutation = useUpdateEvent();

  const managers = adminData?.managers || [];
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      manager_id: '',
      name: '',
      slug: '',
      event_date: '',
      event_time: '',
      city: '',
      description: '',
      rules_text: '',
      has_inventory: false,
      logo_url: '',
      banner_url: '',
      route_image_url: '',
      route_description: '',
      strava_url: '',
      social_media: {
        instagram: '',
        facebook: '',
        twitter: '',
        threads: '',
        tiktok: '',
      },
      payment_info: {
        bank_name: '',
        bank_code: '',
        account_number: '',
        id_number: '',
        phone_number: '',
      },
      organization: {
        name: '',
        logo_url: '',
        email: '',
        phone: '',
      }
    },
  });

  // Sync form with loaded data
  useEffect(() => {
    if (adminData?.events) {
      const event = adminData.events.find((e: any) => e.id === eventId || e.slug === eventId);
      if (event) {
        if (onLoaded) onLoaded(event);
        form.reset({
          id: event.id,
          manager_id: event.manager_id,
          name: event.name || '',
          slug: event.slug || '',
          event_date: event.event_date || '',
          event_time: event.event_time || '',
          city: event.city || '',
          description: event.description || '',
          rules_text: event.rules_text || '',
          has_inventory: !!event.has_inventory,
          logo_url: event.logo_url || '',
          banner_url: event.banner_url || '',
          route_image_url: event.route_image_url || '',
          route_description: event.route_description || '',
          strava_url: event.strava_url || '',
          social_media: {
            instagram: '',
            facebook: '',
            twitter: '',
            threads: '',
            tiktok: '',
            ...(event.social_media || {})
          },
          payment_info: {
            bank_name: '',
            bank_code: '',
            account_number: '',
            id_number: '',
            phone_number: '',
            ...(event.payment_info || {})
          },
          organization: {
            name: event.organization?.name || '',
            logo_url: event.organization?.logo_url || '',
            email: event.organization?.email || '',
            phone: event.organization?.phone || '',
          }
        });
      }
    }
  }, [adminData, eventId, onLoaded, form]);

  // Sync tab with URL if isPage
  useEffect(() => {
    if (isPage) {
      const tab = searchParams.get("tab");
      if (tab) setActiveTab(tab);
    }
  }, [searchParams, isPage]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.push(`?${params.toString()}`);
    }
  };

  const handleSlugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onSubmit = async (values: ConfigFormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Configuración actualizada');
        if (onUpdate) onUpdate();
      },
      onError: (error) => {
        toast.error('Error al actualizar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    });
  };

  const onInvalid = (errors: any) => {
    console.error('Form validation errors:', errors);
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      toast.error(`Hay ${errorCount} error(es) en el formulario. Por favor revisa todas las pestañas.`);
    }
  };

  const event = adminData?.events?.find((e: any) => e.id === eventId || e.slug === eventId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="font-mono text-sm uppercase font-black">Cargando configuración...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 border-4 border-dashed border-black/10 bg-muted/30">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <div className="text-center space-y-2">
          <h3 className="font-satoshi text-2xl font-black uppercase italic">Evento no encontrado</h3>
          <p className="text-muted-foreground font-medium italic">
            No tienes permisos para editar este evento o no existe en nuestra base de datos.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-none border-2 border-black font-black uppercase italic h-12 px-8"
          onClick={() => router.push('/dashboard/events')}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mb-2">
            Configuración del <span className="text-primary">Evento</span>
          </h2>
          <p className="text-muted-foreground font-mono text-[10px] md:text-xs uppercase tracking-wider">
            Gestiona información general, etapas de inscripción y categorías
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-muted p-1 rounded-none border-2 border-black dark:border-white h-auto mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
          <TabsTrigger value="general" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm">
            <Info className="mr-2 size-4 hidden sm:inline" />
            General
          </TabsTrigger>
          <TabsTrigger value="media" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm">
            <ImageIcon className="mr-2 size-4 hidden sm:inline" />
            Media
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm">
            <Tag className="mr-2 size-4 hidden sm:inline" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="stages" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm">
            <Layers className="mr-2 size-4 hidden sm:inline" />
            Etapas
          </TabsTrigger>
          <TabsTrigger value="registrations" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm">
            <User className="mr-2 size-4 hidden sm:inline" />
            Inscritos
          </TabsTrigger>
          <TabsTrigger value="awards" disabled className="rounded-none opacity-60 cursor-not-allowed font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm flex flex-col items-center justify-center gap-0">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 size-3 text-amber-500" />
              Premiación
            </div>
            <span className="text-[7px] font-mono tracking-widest text-amber-500/80">PRÓXIMAMENTE</span>
          </TabsTrigger>
          <TabsTrigger value="kits" disabled className="rounded-none opacity-60 cursor-not-allowed font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm flex flex-col items-center justify-center gap-0">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 size-3 text-amber-500" />
              Kits
            </div>
            <span className="text-[7px] font-mono tracking-widest text-amber-500/80">PRÓXIMAMENTE</span>
          </TabsTrigger>
          <TabsTrigger value="sponsors" disabled className="rounded-none opacity-60 cursor-not-allowed font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm flex flex-col items-center justify-center gap-0">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 size-3 text-amber-500" />
              Sponsors
            </div>
            <span className="text-[7px] font-mono tracking-widest text-amber-500/80">PRÓXIMAMENTE</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" disabled className="rounded-none opacity-60 cursor-not-allowed font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm flex flex-col items-center justify-center gap-0">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 size-3 text-amber-500" />
              Galería
            </div>
            <span className="text-[7px] font-mono tracking-widest text-amber-500/80">PRÓXIMAMENTE</span>
          </TabsTrigger>
          <TabsTrigger value="surprises" disabled className="rounded-none opacity-60 cursor-not-allowed font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm flex flex-col items-center justify-center gap-0">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 size-3 text-amber-500" />
              Sorpresas
            </div>
            <span className="text-[7px] font-mono tracking-widest text-amber-500/80">PRÓXIMAMENTE</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black font-black uppercase italic px-4 py-3 tracking-tight text-xs md:text-sm">
            <CreditCard className="mr-2 size-4 hidden sm:inline" />
            Datos Bancarios
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
            <TabsContent value="general" className="space-y-8">
              <GeneralTab 
                managers={managers} 
                onSlugify={handleSlugify} 
              />
            </TabsContent>

            <TabsContent value="media" className="space-y-8">
              <MediaTab eventId={form.getValues('id') || eventId} />
            </TabsContent>

            <TabsContent value="payments" className="space-y-8">
              <BankDataTab />
            </TabsContent>

            <ConfigActions 
              activeTab={activeTab} 
              isPending={updateMutation.isPending} 
              onDelete={onDelete} 
            />
          </form>
        </Form>

        <TabsContent value="categories" className="space-y-6">
          <CategoryManagement eventId={form.getValues('id') || eventId} />
        </TabsContent>

        <TabsContent value="stages" className="space-y-6">
          <StageManagement eventId={form.getValues('id') || eventId} />
        </TabsContent>

        <TabsContent value="registrations" className="space-y-6">
          <RegistrationManagement eventId={form.getValues('id') || eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
