"use client";

import Image from "next/image";
import { 
  CheckCircle2, 
  XCircle, 
  Info, 
  User as UserIcon, 
  Hash, 
  Calendar,
  DollarSign,
  Loader2,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useUpdateRegistrationStatus } from "@/hooks/queries/useRegistrations";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PaymentDrawerProps {
  registration: any | null;
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export function PaymentDrawer({ registration, isOpen, onClose, eventId }: PaymentDrawerProps) {
  const updateStatus = useUpdateRegistrationStatus();

  if (!registration) return null;

  const payment = registration.payment;

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ 
        registrationId: registration.id, 
        status, 
        eventId 
      });
      toast.success(`Estado actualizado a ${status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar estado");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED': return { label: 'Aprobado', color: 'bg-green-600' };
      case 'REJECTED': return { label: 'Rechazado', color: 'bg-destructive' };
      case 'PENDING': return { label: 'Pendiente', color: 'bg-yellow-500' };
      default: return { label: 'Reportado', color: 'bg-primary' };
    }
  };

  const statusConfig = getStatusConfig(registration.status);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0 rounded-none border-l-4 border-primary bg-background shadow-[-10px_0px_30px_rgba(0,0,0,0.1)]">
        <SheetHeader className="p-6 bg-muted/30 border-b">
          <div className="flex items-center justify-between mb-4">
            <Badge className={`rounded-none font-mono text-[9px] uppercase tracking-widest px-3 py-1 ${statusConfig.color}`}>
              {statusConfig.label}
            </Badge>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              {format(new Date(registration.created_at), "dd-MM-yyyy")}
            </span>
          </div>
          <SheetTitle className="text-2xl font-black uppercase italic tracking-tighter">
            Revisar <span className="text-primary">Pago</span>
          </SheetTitle>
          <SheetDescription className="font-mono text-[9px] uppercase tracking-widest">
            ID: {registration.id.split('-')[0]}...
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Athlete Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <UserIcon className="size-4" />
              <h4 className="font-black uppercase italic text-sm tracking-tight">Detalles del Atleta</h4>
            </div>
            <div className="bg-muted/30 p-4 border border-border space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Nombre Completo</span>
                <span className="font-bold uppercase italic">{registration.first_name} {registration.last_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Cédula / ID</span>
                <span className="font-mono font-bold tracking-tighter text-sm">{registration.dni}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Categoría</span>
                <Badge variant="outline" className="rounded-none font-mono text-[9px] uppercase">
                  {registration.category?.name || "Sin categoría"}
                </Badge>
              </div>
            </div>
          </section>

          {/* Financial Breakdown */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <DollarSign className="size-4" />
              <h4 className="font-black uppercase italic text-sm tracking-tight">Desglose Financiero</h4>
            </div>
            {payment ? (
              <div className="space-y-3 font-mono text-[11px] uppercase p-4 border-2 border-dashed border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto USD</span>
                  <span className="font-bold text-lg">${payment.amount_usd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reportado VES</span>
                  <span className="font-bold text-primary">{payment.amount_ves} VES</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasa Aplicada</span>
                  <span>{payment.exchange_rate_bcv} VES</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-center items-center gap-2 py-2 bg-muted/50 mt-2 border border-border font-mono text-[10px] tracking-widest font-bold">
                  REF: {payment.reference_number || "S/N"}
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                <AlertTriangle className="size-8 mb-2" />
                <span className="font-mono text-[10px] uppercase font-black">Sin información de pago</span>
              </div>
            )}
          </section>

          {/* Receipt Image */}
          {payment?.receipt_url && (
            <section className="space-y-4 pb-8">
              <div className="flex items-center gap-3 text-primary">
                <Info className="size-4" />
                <h4 className="font-black uppercase italic text-sm tracking-tight">Comprobante</h4>
              </div>
              <div className="relative aspect-[3/4] w-full border-2 border-black overflow-hidden group">
                <img 
                  src={payment.receipt_url} 
                  alt="Comprobante Bancario" 
                  className="w-full h-full object-contain bg-muted transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <a 
                    href={payment.receipt_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="rounded-none bg-white text-black px-4 py-2 font-bold uppercase italic text-[10px] flex items-center gap-2"
                  >
                    <ExternalLink className="size-3" /> Ver Original
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t grid grid-cols-2 gap-4">
            <Button 
              disabled={updateStatus.isPending}
              onClick={() => handleUpdateStatus('REJECTED')}
              className="rounded-none bg-destructive hover:bg-destructive/90 text-white border-0 py-6 font-black uppercase italic tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
                {updateStatus.isPending ? <Loader2 className="animate-spin size-5" /> : <><XCircle className="mr-2 size-5" /> RECHAZAR</>}
            </Button>
            <Button 
              disabled={updateStatus.isPending}
              onClick={() => handleUpdateStatus('APPROVED')}
              className="rounded-none bg-green-600 hover:bg-green-700 text-white border-0 py-6 font-black uppercase italic tracking-widest shadow-[4px_4px_0px_0px_rgba(21,128,61,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
                {updateStatus.isPending ? <Loader2 className="animate-spin size-5" /> : <><CheckCircle2 className="mr-2 size-5" /> APROBAR</>}
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

