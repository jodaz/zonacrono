"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  MoreHorizontal, 
  Mail, 
  ShieldAlert, 
  Loader2, 
  KeyRound,
  Trash2,
  Edit2,
  Ban,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Form,
} from "@/components/ui/form";
import { FormInput, FormSelect, FormSwitch, FormPasswordInput } from "@/components/ui/forms";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { translateAuthError } from "@/lib/utils";
import type { Manager } from "@/app/api/managers/route";
import { 
  useManagers, 
  useCreateManager, 
  useUpdateManager, 
  useDeleteManager 
} from "@/hooks/queries/useManagers";

// --- ZOD SCHEMAS ---

const createManagerSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["admin", "superadmin"]),
});

const updateManagerSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  email: z.string().email("Correo electrónico inválido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").or(z.literal("")).optional(),
  role: z.enum(["admin", "superadmin"]).optional(),
  is_active: z.boolean().optional(),
});

type CreateFormValues = z.infer<typeof createManagerSchema>;
type UpdateFormValues = z.infer<typeof updateManagerSchema>;

export default function ManagersPage() {
  const router = useRouter();
  const { role, user, isLoading: authLoading } = useAuthStore();
  
  // React Query Hooks
  const { data: managers = [], isLoading } = useManagers();
  const createMutation = useCreateManager();
  const updateMutation = useUpdateManager();
  const deleteMutation = useDeleteManager();

  useEffect(() => {
    if (!authLoading && role !== 'superadmin') {
      router.replace('/dashboard/overview');
    }
  }, [authLoading, role, router]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  // Forms
  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createManagerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "admin",
    },
  });

  const editForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateManagerSchema),
    defaultValues: {
      id: "",
      name: "",
      email: "",
      password: "",
      role: "admin",
      is_active: true,
    },
  });

  // Handle Create
  const handleCreateManager = (values: CreateFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Manager creado", {
          description: `Se ha creado la cuenta para ${values.name} correctamente.`
        });
        createForm.reset();
        setIsCreateModalOpen(false);
      },
      onError: (error: any) => {
        toast.error("Error", {
          description: translateAuthError(error.message || "No se pudo crear la cuenta.")
        });
      }
    });
  };

  // Handle Update
  const handleUpdateManager = (values: UpdateFormValues) => {
    // If password is empty, don't send it
    const data = { ...values };
    if (!data.password) delete data.password;

    updateMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Manager actualizado", {
          description: `Se han guardado los cambios para ${values.name}.`
        });
        setIsEditModalOpen(false);
        setSelectedManager(null);
      },
      onError: (error: any) => {
        toast.error("Error", {
          description: translateAuthError(error.message || "No se pudo actualizar la cuenta.")
        });
      }
    });
  };

  // Handle Delete
  const handleDeleteManager = () => {
    if (!selectedManager) return;

    deleteMutation.mutate(selectedManager.id, {
      onSuccess: () => {
        toast.success("Manager eliminado", {
          description: "La cuenta ha sido eliminada permanentemente del sistema."
        });
        setIsDeleteModalOpen(false);
        setSelectedManager(null);
      },
      onError: (error: any) => {
        toast.error("Error", {
          description: translateAuthError(error.message || "No se pudo eliminar la cuenta.")
        });
      }
    });
  };

  const openEditModal = (manager: Manager) => {
    setSelectedManager(manager);
    editForm.reset({
      id: manager.id,
      name: manager.name,
      email: manager.email,
      role: manager.role,
      is_active: manager.is_active,
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (manager: Manager) => {
    setSelectedManager(manager);
    setIsDeleteModalOpen(true);
  };

  if (authLoading || role !== 'superadmin') {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-satoshi text-3xl font-black uppercase tracking-tight italic text-foreground">
            Cuentas de <span className="text-primary">Manager</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Gestiona los organizadores de eventos y sus accesos al sistema.
          </p>
        </div>

        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black italic uppercase tracking-widest rounded-none gap-2 h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
          Añadir Nuevo Manager
        </Button>
      </div>

      <div className="bg-card border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] animate-pulse">Cargando base de datos...</span>
          </div>
        ) : managers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <ShieldAlert className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
            <p className="font-medium text-muted-foreground italic">No se encontraron managers en el sistema.</p>
            <Button variant="link" onClick={() => setIsCreateModalOpen(true)} className="text-primary font-bold uppercase italic tracking-widest">
              Crea el primero ahora
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/5 dark:bg-white/5">
                <TableRow className="hover:bg-transparent border-b-2 border-black dark:border-white">
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em] py-5 px-6 font-bold text-foreground border-r-2 border-black/10 dark:border-white/10">Nombre del Manager</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em] py-5 px-6 font-bold text-foreground border-r-2 border-black/10 dark:border-white/10">Identidad Digital (Email)</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em] py-5 px-6 font-bold text-foreground text-center border-r-2 border-black/10 dark:border-white/10">Rol</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em] py-5 px-6 font-bold text-foreground text-center border-r-2 border-black/10 dark:border-white/10">Estado</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em] py-5 px-6 font-bold text-foreground border-r-2 border-black/10 dark:border-white/10">Fecha Registro</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-[0.2em] py-5 px-6 font-bold text-foreground text-right">Sistema</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager: Manager) => (
                  <TableRow key={manager.id} className="border-b-2 border-black/10 transition-colors hover:bg-primary/5 group">
                    <TableCell className="font-black py-5 px-6 italic text-lg uppercase tracking-tight group-hover:text-primary transition-colors">
                      {manager.name}
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-2 font-mono text-sm font-bold text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        {manager.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-5 px-6">
                      <Badge className="rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-white font-black italic uppercase text-[9px] tracking-[0.2em] px-3 py-1 border-2 border-black dark:border-white box-content h-3 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(var(--primary-rgb),0.5)]">
                        {manager.role === 'superadmin' ? 'SUPER' : 'ADMIN'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-5 px-6">
                      {manager.is_active ? (
                        <div className="flex items-center justify-center gap-1 text-green-600 font-black italic uppercase text-[10px] tracking-widest">
                          <CheckCircle2 className="h-3 w-3" />
                          Activo
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-destructive font-black italic uppercase text-[10px] tracking-widest">
                          <Ban className="h-3 w-3" />
                          Bloqueado
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-5 px-6 font-mono text-xs font-bold whitespace-nowrap">
                      {manager.created_at ? format(new Date(manager.created_at), "dd-MM-yyyy · HH:mm") : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right py-5 px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 rounded-none border-2 border-transparent hover:border-black hover:bg-primary/10 transition-all">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none border-2 border-black dark:border-white w-64 p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-card overflow-hidden">
                          <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-3 bg-black dark:bg-white text-white dark:text-black border-b-2 border-black dark:border-white">
                            Control de Sistema
                          </DropdownMenuLabel>
                          <div className="p-1">
                            <DropdownMenuItem 
                              onClick={() => openEditModal(manager)}
                              className="flex items-center gap-3 px-3 py-3 cursor-pointer font-bold italic uppercase text-xs tracking-wider hover:bg-primary/5"
                            >
                              <Edit2 className="h-4 w-4 text-primary" />
                              Editar / Cambiar Contraseña
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-black/10 h-[2px]" />
                            <DropdownMenuItem 
                              disabled={manager.id === user?.id}
                              onClick={() => openDeleteModal(manager)}
                              className="flex items-center gap-3 px-3 py-3 cursor-pointer font-black italic uppercase text-xs tracking-wider text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={3} />
                              Eliminar Cuenta
                            </DropdownMenuItem>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-none border-2 border-black dark:border-white p-0 overflow-hidden bg-card">
          <div className="bg-primary p-4 border-b-2 border-black dark:border-white">
            <DialogTitle className="font-satoshi font-black uppercase tracking-tight italic text-2xl text-primary-foreground">
              NUEVA <span className="text-black">CUENTA</span>
            </DialogTitle>
          </div>
          <div className="p-6 pt-4">
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateManager)} className="space-y-4">
                <FormInput 
                  control={createForm.control}
                  name="name"
                  label="Nombre Completo"
                  placeholder="Ej. Juan Pérez"
                />
                <FormInput 
                  control={createForm.control}
                  name="email"
                  label="Correo Electrónico"
                  type="email"
                  placeholder="juan@ejemplo.com"
                />
                <FormPasswordInput 
                  control={createForm.control}
                  name="password"
                  label="Contraseña Inicial"
                  placeholder="••••••••"
                />
                <FormSelect 
                  control={createForm.control}
                  name="role"
                  label="Rol de Usuario"
                  options={[
                    { value: "admin", label: "Administrador (Eventos)" },
                    { value: "superadmin", label: "Superadmin (Sistema)" },
                  ]}
                />
                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 font-black uppercase italic tracking-widest rounded-none h-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                  >
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "CREAR CUENTA"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-none border-2 border-black dark:border-white p-0 overflow-hidden bg-card">
          <div className="bg-black dark:bg-white p-4 border-b-2 border-black dark:border-white">
            <DialogTitle className="font-satoshi font-black uppercase tracking-tight italic text-2xl text-white dark:text-black">
              EDITAR <span className="text-primary">PERFIL</span>
            </DialogTitle>
          </div>
          <div className="p-6 pt-4">
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdateManager)} className="space-y-4">
                <FormInput 
                  control={editForm.control}
                  name="name"
                  label="Nombre Completo"
                />
                <FormInput 
                  control={editForm.control}
                  name="email"
                  label="Correo Electrónico"
                  type="email"
                />
                <FormPasswordInput 
                  control={editForm.control}
                  name="password"
                  label="Nueva Contraseña (Opcional)"
                  placeholder="Dejar en blanco para mantener actual"
                />
                <FormSelect 
                  control={editForm.control}
                  name="role"
                  label="Rol de Usuario"
                  disabled={selectedManager?.id === user?.id}
                  options={[
                    { value: "admin", label: "Administrador (Eventos)" },
                    { value: "superadmin", label: "Superadmin (Sistema)" },
                  ]}
                />
                <FormSwitch 
                  control={editForm.control}
                  name="is_active"
                  label="Cuenta Activa"
                  description="Permitir acceso al sistema"
                  disabled={selectedManager?.id === user?.id}
                />
                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 font-black uppercase italic tracking-widest rounded-none h-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                  >
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "GUARDAR CAMBIOS"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="rounded-none border-2 border-black dark:border-white bg-card">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <AlertCircle className="h-8 w-8" strokeWidth={3} />
              <AlertDialogTitle className="font-satoshi font-black uppercase italic text-2xl tracking-tight">
                ¿ELIMINAR CUENTA?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="font-bold text-foreground/80">
              Esta acción es permanente. Se eliminará el acceso de <span className="text-primary font-black uppercase">{selectedManager?.name}</span> y todos sus registros asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-none border-2 border-black font-black uppercase italic tracking-widest h-12">
              CANCELAR
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteManager}
              className="rounded-none border-2 border-black bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black uppercase italic tracking-widest h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              ELIMINAR PERMANENTEMENTE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex items-center justify-between border-2 border-black dark:border-white bg-muted p-4 font-mono text-[10px] uppercase tracking-[0.3em] font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        <div className="flex items-center gap-4">
          <span>SISTEMA: ZONACRONO_OS_V1</span>
          <span className="text-primary">ESTADO: OPERACIONAL</span>
        </div>
        <div>
          CUENTAS ACTIVAS: {managers.filter((m: Manager) => m.is_active).length} / {managers.length}
        </div>
      </div>
    </div>
  );
}
