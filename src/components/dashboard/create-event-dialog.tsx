"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  Button,
  Form
} from "@/components/ui";
import { Loader2, Plus } from "lucide-react";
import { FormInput, FormSelect, FormCombobox, FormDatePicker } from "@/components/ui/forms";
import { useProvisionEvent } from "@/hooks/queries/useEvents";
import { toast } from "sonner";
import { VENEZUELA_CITIES } from "@/lib";

const eventSchema = z.object({
  manager_id: z.string().min(1, 'El organizador es requerido'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  slug: z.string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener minúsculas, números y guiones'),
  event_date: z.string().min(1, 'La fecha es requerida'),
  event_time: z.string().min(1, 'La hora es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface CreateEventDialogProps {
  managers: Manager[];
  trigger?: React.ReactNode;
}

export function CreateEventDialog({ managers, trigger }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const provisionMutation = useProvisionEvent();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      manager_id: '',
      name: '',
      slug: '',
      event_date: '',
      event_time: '',
      city: ''
    }
  });

  const { watch, setValue, reset } = form;

  const handleSlugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'name') {
        setValue('slug', handleSlugify(value.name || ''), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const onSubmit = async (values: EventFormValues) => {
    provisionMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Evento creado correctamente');
        setOpen(false);
        reset();
      },
      onError: (error: any) => {
        toast.error(error.message || 'Error al crear el evento');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-11 rounded-none border-2 border-black bg-primary hover:bg-primary/90 text-white font-black italic uppercase text-xs tracking-widest px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-none border-4 border-black p-0 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader className="bg-black p-6 text-white">
              <DialogTitle className="font-satoshi text-2xl font-black italic uppercase">Crear Evento</DialogTitle>
              <DialogDescription className="font-medium italic text-gray-400">
                Crea un nuevo evento y asígnalo a un organizador.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6 space-y-6">
              <FormSelect
                control={form.control}
                name="manager_id"
                label="Organizador Responsable"
                placeholder="Seleccionar organizador"
                options={managers.map((m) => ({ 
                  value: m.id, 
                  label: m.name, 
                  email: m.email 
                }))}
              />
              
              <FormInput
                control={form.control}
                name="name"
                label="Nombre del Evento"
                placeholder="Ej. Maratón de la Ciudad"
              />
              
              <FormInput
                control={form.control}
                name="slug"
                label="Slug URL"
                placeholder="maraton-ciudad"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormDatePicker
                  control={form.control}
                  name="event_date"
                  label="Fecha"
                />
                <FormInput
                  control={form.control}
                  name="event_time"
                  label="Hora"
                  type="time"
                />
              </div>

              <FormCombobox
                control={form.control}
                name="city"
                label="Ciudad"
                placeholder="Seleccionar ciudad"
                options={VENEZUELA_CITIES}
              />
            </div>

            <DialogFooter className="p-6 bg-muted/30 border-t-2 border-black/5">
              <Button 
                type="submit" 
                disabled={provisionMutation.isPending} 
                className="w-full rounded-none border-2 border-black bg-black text-white font-black italic uppercase py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                {provisionMutation.isPending ? <Loader2 className="animate-spin" /> : 'Confirmar Creación'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
