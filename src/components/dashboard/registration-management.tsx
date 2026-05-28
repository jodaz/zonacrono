"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MoreHorizontal,
  Clock,
  User,
  CreditCard,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRegistrations, useUpdateRegistrationStatus } from "@/hooks/queries/useRegistrations";

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  email: string;
  status: 'PENDING' | 'REPORTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  created_at: string;
  category: { name: string };
  stage: { name: string };
  phone: string;
  blood_type: string;
  state: string;
  city: string;
  club: string;
  payment?: {
    amount_usd: number;
    amount_ves: number;
    reference_number: string;
    receipt_url: string;
    reported_at: string;
  };
}

interface RegistrationManagementProps {
  eventId: string;
}

export function RegistrationManagement({ eventId }: RegistrationManagementProps) {
  // React Query Hooks
  const { data: regData, isLoading } = useRegistrations(eventId);
  const statusMutation = useUpdateRegistrationStatus();
  
  const registrations = regData?.registrations || [];

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleUpdateStatus = async (regId: string, status: string) => {
    statusMutation.mutate({ 
      registrationId: regId, 
      status,
      eventId 
    }, {
      onSuccess: () => {
        toast.success(`Estado actualizado a ${status}`);
        setIsDetailOpen(false);
      },
      onError: (error: any) => {
        toast.error(error.message || "Error al actualizar estado");
      }
    });
  };

  const filteredRegistrations = registrations.filter((reg: Registration) => {
    const matchesSearch = 
      `${reg.first_name} ${reg.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      reg.dni.includes(search) ||
      reg.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || reg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'REPORTED': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reportado</Badge>;
      case 'APPROVED': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aprobado</Badge>;
      case 'REJECTED': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rechazado</Badge>;
      case 'EXPIRED': return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expirado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="font-mono text-sm uppercase font-black">Cargando inscripciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/30 p-4 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre, DNI o email..." 
            className="pl-10 rounded-none border-2 border-black dark:border-white focus-visible:ring-0 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            className="h-10 px-3 py-2 rounded-none border-2 border-black dark:border-white bg-background text-sm font-bold uppercase italic focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="REPORTED">Reportados</option>
            <option value="APPROVED">Aprobados</option>
            <option value="REJECTED">Rechazados</option>
          </select>

          <Button variant="outline" className="hidden rounded-none border-2 border-black dark:border-white h-10 font-black uppercase text-xs italic bg-background hover:bg-muted">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-black dark:border-white bg-card overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        <Table>
          <TableHeader className="bg-black dark:bg-white">
            <TableRow className="hover:bg-black dark:hover:bg-white border-none">
              <TableHead className="text-white dark:text-black font-black uppercase italic h-12">Atleta</TableHead>
              <TableHead className="text-white dark:text-black font-black uppercase italic h-12">DNI</TableHead>
              <TableHead className="text-white dark:text-black font-black uppercase italic h-12">Categoría</TableHead>
              <TableHead className="text-white dark:text-black font-black uppercase italic h-12">Estado</TableHead>
              <TableHead className="text-white dark:text-black font-black uppercase italic h-12">Fecha</TableHead>
              <TableHead className="text-white dark:text-black font-black uppercase italic h-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center font-mono text-muted-foreground bg-background">
                  No se encontraron inscripciones.
                </TableCell>
              </TableRow>
            ) : (
              filteredRegistrations.map((reg: Registration) => (
                <TableRow key={reg.id} className="border-b border-black/10 dark:border-white/10 hover:bg-muted/30">
                  <TableCell className="font-bold text-foreground">
                    <div className="flex flex-col">
                      <span>{reg.first_name} {reg.last_name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono lowercase">{reg.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">{reg.dni}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase text-foreground">{reg.category?.name}</span>
                      <span className="text-[9px] text-muted-foreground uppercase">{reg.stage?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(reg.status)}</TableCell>
                  <TableCell className="text-xs font-mono text-foreground">
                    {format(new Date(reg.created_at), "dd-MM-yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-2 border-transparent hover:border-black dark:hover:border-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-none border-2 border-black dark:border-white font-mono bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                        <DropdownMenuLabel className="text-[10px] uppercase font-black">Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setSelectedReg(reg); setIsDetailOpen(true); }} className="cursor-pointer font-bold text-xs uppercase hover:bg-primary/10">
                          <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
...
                        {reg.status === 'REPORTED' && (
                          <>
                            <DropdownMenuItem 
                              className="text-green-600 font-black text-xs uppercase cursor-pointer"
                              onClick={() => handleUpdateStatus(reg.id, 'APPROVED')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Aprobar Pago
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 font-black text-xs uppercase cursor-pointer"
                              onClick={() => handleUpdateStatus(reg.id, 'REJECTED')}
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Rechazar Pago
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl rounded-none border-4 border-black dark:border-white p-0 overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] bg-card">
          <DialogHeader className="bg-black dark:bg-white text-white dark:text-black p-6">
            <DialogTitle className="font-satoshi text-2xl font-black uppercase italic tracking-tighter">
              Detalle de Inscripción
            </DialogTitle>
            <DialogDescription className="text-white/70 dark:text-black/70 font-mono text-xs uppercase">
              ID: {selectedReg?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 grid gap-6 md:grid-cols-2">
            {/* Athlete Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <User className="h-4 w-4" />
                <h4 className="font-black uppercase italic text-sm">Atleta</h4>
              </div>
              <div className="space-y-2 font-mono text-xs bg-muted/30 p-4 border-2 border-black dark:border-white">
                <p><span className="text-muted-foreground uppercase">Nombre:</span> <span className="font-bold text-foreground">{selectedReg?.first_name} {selectedReg?.last_name}</span></p>
                <p><span className="text-muted-foreground uppercase">DNI:</span> <span className="font-bold text-foreground">{selectedReg?.dni}</span></p>
                <p><span className="text-muted-foreground uppercase">Email:</span> <span className="font-bold lowercase text-foreground">{selectedReg?.email}</span></p>
                <p><span className="text-muted-foreground uppercase">Teléfono:</span> <span className="font-bold text-foreground">{selectedReg?.phone}</span></p>
                <p><span className="text-muted-foreground uppercase">Sangre:</span> <span className="font-bold text-foreground">{selectedReg?.blood_type}</span></p>
                <p><span className="text-muted-foreground uppercase">Ubicación:</span> <span className="font-bold text-foreground">{selectedReg?.city}, {selectedReg?.state}</span></p>
                <p><span className="text-muted-foreground uppercase">Club:</span> <span className="font-bold text-foreground">{selectedReg?.club}</span></p>
                <p><span className="text-muted-foreground uppercase">Cat:</span> <span className="font-bold text-foreground">{selectedReg?.category?.name}</span></p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <CreditCard className="h-4 w-4" />
                <h4 className="font-black uppercase italic text-sm">Pago</h4>
              </div>
              {selectedReg?.payment ? (
                <div className="space-y-3">
                  <div className="font-mono text-xs bg-muted/30 p-4 border-2 border-black dark:border-white space-y-2">
                    <p><span className="text-muted-foreground uppercase">Referencia:</span> <span className="font-bold text-primary">#{selectedReg.payment.reference_number}</span></p>
                    <p><span className="text-muted-foreground uppercase">Monto:</span> <span className="font-bold text-foreground">${selectedReg.payment.amount_usd} / {selectedReg.payment.amount_ves} VES</span></p>
                    <p><span className="text-muted-foreground uppercase">Reportado:</span> <span className="font-bold text-foreground">{selectedReg.payment.reported_at ? format(new Date(selectedReg.payment.reported_at), "dd-MM-yyyy HH:mm") : "N/A"}</span></p>
                  </div>
                  <a 
                    href={selectedReg.payment.receipt_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block w-full py-2 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-center text-[10px] font-black uppercase italic hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all"
                  >
                    Ver Comprobante
                  </a>
                </div>
              ) : (
                <div className="h-[120px] flex flex-col items-center justify-center border-2 border-dashed border-black dark:border-white bg-muted/10">
                  <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="font-mono text-[10px] uppercase text-muted-foreground font-black">Sin reporte de pago</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="bg-muted p-6 border-t-2 border-black dark:border-white">
            <div className="flex gap-3 w-full justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsDetailOpen(false)}
                className="rounded-none border-2 border-black dark:border-white font-black uppercase text-xs italic bg-background hover:bg-muted"
              >
                Cerrar
              </Button>
              
              {selectedReg?.status === 'REPORTED' && (
                <>
                  <Button 
                    variant="destructive"
                    disabled={statusMutation.isPending}
                    onClick={() => handleUpdateStatus(selectedReg.id, 'REJECTED')}
                    className="rounded-none border-2 border-black dark:border-white font-black uppercase text-xs italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {statusMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <XCircle className="mr-2 h-4 w-4" />}
                    Rechazar
                  </Button>
                  <Button 
                    disabled={statusMutation.isPending}
                    onClick={() => handleUpdateStatus(selectedReg.id, 'APPROVED')}
                    className="rounded-none border-2 border-black dark:border-white bg-primary text-white font-black uppercase text-xs italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {statusMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Aprobar Inscripción
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
