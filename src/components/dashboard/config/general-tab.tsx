"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { FormInput, FormTextarea, FormSelect, FormCombobox, FormFileUploader, FormDatePicker } from "@/components/ui/forms";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input } from "../../ui";
import { VENEZUELA_CITIES } from "@/lib";

interface GeneralTabProps {
  managers: any[];
  onSlugify: (text: string) => string;
}

export function GeneralTab({ managers, onSlugify }: GeneralTabProps) {
  const { control, setValue } = useFormContext();
  return (
    <Card className="border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-card">
      <CardHeader className="bg-muted/30 border-b-2 border-black dark:border-white">
        <CardTitle className="font-satoshi font-black italic uppercase text-xl">Información General</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <FormCombobox
          control={control}
          name="manager_id"
          label="Organizador"
          placeholder="Seleccionar organizador"
          options={(managers || []).map((m: any) => ({
            value: m.id,
            label: m.name + (m.email ? ` (${m.email})` : ""),
          }))}
          emptyText="No se encontraron organizadores."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="font-mono text-[10px] uppercase tracking-widest font-bold">
                  Nombre del Evento
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    placeholder="Ej: Maratón de Caracas"
                    className="rounded-none border-2 border-black h-11 font-bold italic"
                    onChange={(e) => {
                      field.onChange(e);
                      const slug = onSlugify(e.target.value);
                      setValue('slug', slug);
                    }}
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />

          <FormInput
            control={control}
            name="slug"
            label="Slug (URL)"
            placeholder="maraton-caracas"
            disabled
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormDatePicker
            control={control}
            name="event_date"
            label="Fecha"
          />
          <FormInput
            control={control}
            name="event_time"
            label="Hora"
            type="time"
          />
          <FormCombobox
            control={control}
            name="city"
            label="Ciudad"
            placeholder="Seleccionar ciudad"
            options={VENEZUELA_CITIES}
          />
        </div>

        <FormTextarea
          control={control}
          name="description"
          label="Descripción del Evento"
          placeholder="Escribe una descripción detallada del evento..."
          rows={5}
        />

        <div className="pt-6 border-t-2 border-black/10 space-y-6">
          <h3 className="font-satoshi font-black italic uppercase text-lg text-primary">Organización</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormInput
                control={control}
                name="organization.name"
                label="Nombre de la Organización"
                placeholder="Ej: Jodaz Studio"
              />
              
              <FormInput
                control={control}
                name="organization.email"
                label="Email de Contacto"
                placeholder="organizacion@ejemplo.com"
                type="email"
              />

              <FormInput
                control={control}
                name="organization.phone"
                label="Teléfono de Contacto"
                placeholder="+58 412 0000000"
              />
            </div>

            <FormFileUploader
              control={control}
              name="organization.logo_url"
              label="Logo de la Organización"
              description="Logo oficial de quien organiza el evento."
              bucket="events"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
