"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { FormInput, FormTextarea, FormSwitch, FormFileUploader } from "@/components/ui/forms";
import { useUpdateEvent } from "@/hooks/queries/useEvents";

interface MediaTabProps {
  eventId: string;
}

export function MediaTab({ eventId }: MediaTabProps) {
  const { control } = useFormContext();
  const { mutate: updateEvent } = useUpdateEvent();

  return (
    <Card className="border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-card">
      <CardHeader className="bg-muted/30 border-b-2 border-black dark:border-white">
        <CardTitle className="font-satoshi font-black italic uppercase text-xl">Media y Ruta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFileUploader
            control={control}
            name="logo_url"
            label="Logo del Evento"
            description="Logo oficial del evento."
            bucket="events"
            onUploadSuccess={(url) => updateEvent({ id: eventId, logo_url: url })}
          />
          <FormFileUploader
            control={control}
            name="banner_url"
            label="Banner del Evento"
            description="Imagen principal de cabecera."
            bucket="events"
            onUploadSuccess={(url) => updateEvent({ id: eventId, banner_url: url })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFileUploader
            control={control}
            name="route_image_url"
            label="Mapa de Ruta"
            description="Imagen de la ruta o circuito."
            bucket="events"
            onUploadSuccess={(url) => updateEvent({ id: eventId, route_image_url: url })}
          />
          <FormInput
            control={control}
            name="strava_url"
            label="ID de Ruta de Strava"
            placeholder="Ej: 31234567"
            description="El identificador numérico de la ruta en Strava para poder embeberla y enlazarla."
          />
        </div>

        <FormTextarea
          control={control}
          name="route_description"
          label="Descripción de la Ruta"
          description="Información detallada sobre el recorrido, altimetría, puntos de interés, etc."
          className="min-h-[100px]"
        />

        <div className="pt-4 border-t-2 border-black/5 space-y-6">
          <h3 className="font-black italic uppercase text-lg text-primary">Redes Sociales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              control={control}
              name="social_media.instagram"
              label="Instagram URL"
              placeholder="https://instagram.com/..."
            />
            
            <FormInput
              control={control}
              name="social_media.facebook"
              label="Facebook URL"
              placeholder="https://facebook.com/..."
            />

            <FormInput
              control={control}
              name="social_media.twitter"
              label="X (Twitter) URL"
              placeholder="https://x.com/..."
            />

            <FormInput
              control={control}
              name="social_media.threads"
              label="Threads URL"
              placeholder="https://threads.net/..."
            />

            <FormInput
              control={control}
              name="social_media.tiktok"
              label="TikTok URL"
              placeholder="https://tiktok.com/@..."
            />
          </div>
        </div>

        <FormSwitch
          control={control}
          name="has_inventory"
          label="Gestionar Inventario (Tallas)"
          description="Solicitar talla durante el registro."
        />

        <FormTextarea
          control={control}
          name="rules_text"
          label="Reglamento"
          className="min-h-[150px]"
        />
      </CardContent>
    </Card>
  );
}
