"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Timer, 
  ArrowLeft, 
  User, 
  CreditCard, 
  ShirtIcon, 
  CheckCircle, 
  Upload,
  Loader2,
  AlertCircle,
  Copy
} from "lucide-react";
import { cn } from "@/lib";
import { 
  Label, 
  RadioGroup, 
  RadioGroupItem, 
  Button, 
  Separator,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Logo
} from "@/components/ui";
import { FormInput, FormSelect, FormDatePicker } from "@/components/ui/forms";
import { toast } from "sonner";
import { registrationSchema, type Registration } from "@/features/events/schemas";
import { getBankByCode, getBankName } from "@/lib/banks";
import { VENEZUELA_STATES, VENEZUELA_CITIES_BY_STATE } from "@/lib/venezuela";

const BLOOD_TYPES = [
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
];

// --- Types ---
interface EventData {
  id: string;
  name: string;
  slug: string;
  has_inventory: boolean;
  banner_url?: string;
  description?: string;
  payment_info?: {
    bank_name: string;
    bank_code?: string | null;
    account_number: string;
    id_number: string;
    phone_number: string;
  } | null;
  categories?: {
    min_age: number;
    gender: string;
  }[];
}

interface RegistrationStage {
  id: string;
  name: string;
  price_usd: number;
  total_capacity: number;
  used_capacity: number;
}

interface RegistrationFormProps {
  event: EventData;
  activeStage: RegistrationStage;
  bcvRate: number;
  slug: string;
}

export function RegistrationForm({ event, activeStage, bcvRate, slug }: RegistrationFormProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  // Calculate the lowest minimum age from categories
  const minAge = event.categories && event.categories.length > 0
    ? Math.min(...event.categories.map(c => c.min_age))
    : 0;

  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - minAge);
  // Set to end of day to be inclusive
  const maxBirthDateStr = maxBirthDate.toISOString().split('T')[0];

  const form = useForm<any>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      event_id: event.id,
      stage_id: activeStage.id,
      first_name: "",
      last_name: "",
      dni: "",
      email: "",
      birth_date: "",
      gender: "MALE",
      phone: "",
      blood_type: "",
      state: "",
      city: "",
      club: "Independiente",
      shirt_size: "",
      payment_data: null
    },
  });

  const selectedStateName = form.watch("state");
  const selectedState = VENEZUELA_STATES.find(s => s.name === selectedStateName);
  const cityOptions = selectedState 
    ? (VENEZUELA_CITIES_BY_STATE[selectedState.id] || []).map(c => ({ value: c, label: c }))
    : [];

  const stateOptions = VENEZUELA_STATES.map(s => ({ value: s.name, label: s.name }));

  const handleNextStep = async () => {
    const fieldsToValidate = [
      "first_name", 
      "last_name", 
      "dni", 
      "email", 
      "birth_date", 
      "gender",
      "phone",
      "blood_type",
      "state",
      "city"
    ];
    if (event.has_inventory) fieldsToValidate.push("shirt_size");
    
    const isValid = await form.trigger(fieldsToValidate as any);
    if (!isValid) {
      toast.error("Por favor completa los campos requeridos correctamente.");
      return;
    }

    try {
      setSubmitting(true);
      const dni = form.getValues("dni");
      
      const res = await fetch(`/api/registrations/check-dni?eventId=${event.id}&dni=${dni}`);
      const data = await res.json();

      if (data.exists) {
        toast.error(data.message || "Ya existe una inscripción con esta cédula.");
        return;
      }

      setStep(2);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("DNI check error:", error);
      toast.error("Error al validar la información. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const uploadReceipt = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error al subir el comprobante");
    }

    const data = await res.json();
    return data.url;
  };

  const onSubmit = async () => {
    const values = form.getValues();
    const isPaidEvent = activeStage.price_usd > 0;
    
    if (isPaidEvent && (!paymentFile || !values.payment_reference)) {
      toast.error("Por favor adjunta el comprobante y el número de referencia.");
      return;
    }

    try {
      setSubmitting(true);
      let receipt_url = "";

      if (isPaidEvent && paymentFile) {
        toast.info("Subiendo comprobante...");
        receipt_url = await uploadReceipt(paymentFile);
      }

      const payload = {
        ...values,
        payment_data: isPaidEvent ? {
          receipt_url,
          reference_number: values.payment_reference,
          amount_ves: parseFloat(((activeStage.price_usd || 0) * bcvRate).toFixed(2)),
          exchange_rate_bcv: bcvRate,
          amount_usd: activeStage.price_usd
        } : null
      };

      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("¡Inscripción enviada con éxito!");
        router.push(`/status/${result.registration_id}`);
      } else {
        toast.error(result.error || "Ocurrió un error al procesar la inscripción.");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Error de conexión con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyBankDetails = () => {
    if (!event.payment_info) return;
    
    const bankName = getBankName(event.payment_info.bank_code) || event.payment_info.bank_name;
    const details = `Banco: ${bankName}
Teléfono: ${event.payment_info.phone_number || 'N/A'}
Cédula: ${event.payment_info.id_number || 'N/A'}
${event.payment_info.account_number ? `Cuenta: ${event.payment_info.account_number}` : ''}`;

    navigator.clipboard.writeText(details);
    toast.success("Datos copiados");
  };

  const priceVes = (activeStage.price_usd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo width={160} height={36} priority />
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-mono text-[10px] uppercase text-muted-foreground leading-none">Paso {step} de 2</span>
              <span className="font-satoshi text-xs font-bold text-primary">{step === 1 ? "Información Personal" : "Pago y Confirmación"}</span>
            </div>
            <Link
              href={`/${slug}`}
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al evento</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8 w-full bg-muted h-1.5 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500 ease-in-out" 
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Title */}
        <div className="mb-10 text-center">
          <h1 className="font-satoshi text-3xl font-black leading-tight text-foreground md:text-5xl italic uppercase tracking-tighter text-balance">
            {event.name}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground font-medium text-sm">
            {activeStage.name} — Inscripción abierta
          </p>
        </div>

        <Form {...form}>
          {step === 1 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Athlete Info */}
              <div className="border-2 border-black bg-card p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-6 flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-satoshi text-lg font-black uppercase tracking-wide text-foreground italic">
                    Información del Atleta
                  </h3>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormInput
                    control={form.control}
                    name="first_name"
                    label="Nombre *"
                    placeholder="Ej: Juan"
                  />
                  <FormInput
                    control={form.control}
                    name="last_name"
                    label="Apellido *"
                    placeholder="Ej: Pérez"
                  />
                  <FormInput
                    control={form.control}
                    name="dni"
                    label="Cédula / Pasaporte *"
                    placeholder="V-00000000"
                  />
                  <FormInput
                    control={form.control}
                    name="email"
                    label="Correo Electrónico *"
                    placeholder="juan@email.com"
                  />
                  
                  <FormDatePicker
                    control={form.control}
                    name="birth_date"
                    label="Fecha de Nacimiento *"
                    disabledDays={(date) => date > maxBirthDate}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-mono text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Género *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4 mt-2"
                          >
                            <div className={cn(
                              "flex items-center gap-2 border-2 border-black p-2 flex-1 cursor-pointer transition-colors",
                              field.value === "MALE" ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                            )}>
                              <RadioGroupItem value="MALE" id="sexo-m" />
                              <Label htmlFor="sexo-m" className="text-xs uppercase font-bold cursor-pointer">Masculino</Label>
                            </div>
                            <div className={cn(
                              "flex items-center gap-2 border-2 border-black p-2 flex-1 cursor-pointer transition-colors",
                              field.value === "FEMALE" ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                            )}>
                              <RadioGroupItem value="FEMALE" id="sexo-f" />
                              <Label htmlFor="sexo-f" className="text-xs uppercase font-bold cursor-pointer">Femenino</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase" />
                      </FormItem>
                    )}
                  />

                  <FormInput
                    control={form.control}
                    name="phone"
                    label="Teléfono Móvil *"
                    placeholder="04120000000"
                  />

                  <FormSelect
                    control={form.control}
                    name="blood_type"
                    label="Tipo de Sangre *"
                    placeholder="Selecciona"
                    options={BLOOD_TYPES}
                  />

                  <FormSelect
                    control={form.control}
                    name="state"
                    label="Estado *"
                    placeholder="Selecciona Estado"
                    options={stateOptions}
                  />

                  <FormSelect
                    control={form.control}
                    name="city"
                    label="Ciudad *"
                    placeholder="Selecciona Ciudad"
                    options={cityOptions}
                    disabled={!selectedStateName}
                  />

                  <FormInput
                    control={form.control}
                    name="club"
                    label="Club / Equipo"
                    placeholder="Ej: Independiente"
                  />
                </div>

                <div className="mt-6 p-4 bg-primary/5 border-l-4 border-primary">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground leading-relaxed">
                     Nota: Tu categoría será asignada automáticamente en función de tu edad y género. <strong>Solo se permite una inscripción por cédula para este evento.</strong>
                  </p>
                </div>
              </div>

              {/* Inventory / Shirt Size */}
              {event.has_inventory && (
                <div className="border-2 border-black bg-card p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="mb-6 flex items-center gap-3">
                    <ShirtIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-satoshi text-lg font-black uppercase tracking-wide text-foreground italic">
                      Talla de Franela
                    </h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="shirt_size"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-3 sm:grid-cols-6 gap-3"
                          >
                            {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                              <div key={size} className="flex flex-col">
                                <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                                <Label
                                  htmlFor={`size-${size}`}
                                  className={cn(
                                    "w-full py-3 text-center border-2 font-mono font-bold cursor-pointer transition-all",
                                    field.value === size 
                                      ? "border-primary bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                                      : "border-black hover:border-primary/50"
                                  )}
                                >
                                  {size}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase mt-4" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  type="button"
                  onClick={handleNextStep}
                  disabled={submitting}
                  className="rounded-none border-2 border-black bg-primary text-white text-sm uppercase font-black px-12 py-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {submitting ? "Validando..." : (activeStage.price_usd > 0 ? "Continuar al Pago" : "Continuar a Confirmación")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Payment Details */}
              {activeStage.price_usd > 0 ? (
                <div className="border-2 border-black bg-card p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="mb-6 flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h3 className="font-satoshi text-lg font-black uppercase tracking-wide text-foreground italic">
                      Detalles de Pago
                    </h3>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2">
                    {/* Bank Info */}
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 border-2 border-black relative group">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleCopyBankDetails}
                          className="absolute top-2 right-2 h-7 w-7 rounded-none border-black hover:bg-primary hover:text-white transition-colors"
                          title="Copiar datos"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <h4 className="font-mono text-[10px] uppercase font-bold text-muted-foreground mb-3 tracking-widest">Datos del Organizador</h4>
                        <div className="space-y-2 font-mono text-xs text-balance pr-6">
                          <p>
                            <span className="text-muted-foreground uppercase">Banco:</span>{" "}
                            <span className="font-bold">
                              {event.payment_info?.bank_code && event.payment_info?.phone_number ? (
                                <span className="text-primary mr-1">[{event.payment_info.bank_code}]</span>
                              ) : null}
                              {getBankName(event.payment_info?.bank_code) || event.payment_info?.bank_name || "No especificado"}
                            </span>
                          </p>
                          <p><span className="text-muted-foreground uppercase">Teléfono:</span> <span className="font-bold">{event.payment_info?.phone_number || "No especificado"}</span></p>
                          <p><span className="text-muted-foreground uppercase">Cédula:</span> <span className="font-bold">{event.payment_info?.id_number || "No especificada"}</span></p>
                          {event.payment_info?.account_number && (
                            <p><span className="text-muted-foreground uppercase">Cuenta:</span> <span className="font-bold break-all">{event.payment_info.account_number}</span></p>
                          )}
                        </div>
                      </div>

                      <div className="p-6 border-2 border-black flex flex-col items-center justify-center gap-2 bg-primary/5">
                        <span className="font-mono text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">Monto a Reportar</span>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black italic text-primary">${activeStage.price_usd} USD</span>
                            <span className="text-lg font-bold text-foreground">~ {priceVes} VES</span>
                        </div>
                        <span className="font-mono text-[9px] uppercase text-muted-foreground font-medium">Tasa BCV: {bcvRate} VES</span>
                      </div>
                    </div>

                    {/* Proof of Payment */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-mono text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Comprobante (Imagen) *</Label>
                        <div className="relative border-2 border-dashed border-black hover:border-primary/50 transition-colors p-8 text-center cursor-pointer group bg-muted/10">
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                          />
                          {paymentFile ? (
                            <div className="flex flex-col items-center gap-2">
                              <CheckCircle className="h-8 w-8 text-primary" />
                              <span className="text-xs font-bold truncate max-w-[200px] italic">{paymentFile.name}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Subir Comprobante</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <FormInput
                        control={form.control}
                        name="payment_reference"
                        label="Número de Referencia *"
                        placeholder="Ej: 987654"
                      />
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-primary/5 border-2 border-primary flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] font-black text-primary uppercase leading-relaxed tracking-tight">
                      IMPORTANTE: Es obligatorio adjuntar el comprobante y la referencia de pago para completar tu inscripción.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-black bg-card p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center">
                  <CheckCircle className="h-16 w-16 text-primary mb-4" />
                  <h3 className="font-satoshi text-2xl font-black uppercase tracking-wide text-foreground italic mb-2">
                    Inscripción Gratuita
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    Esta etapa del evento es gratuita. No necesitas realizar ningún pago. Haz clic en completar para confirmar tu participación.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  className="font-mono text-[10px] uppercase font-black text-muted-foreground hover:text-primary order-2 sm:order-1"
                  disabled={submitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver a información
                </Button>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
                  <Button 
                    type="button"
                    onClick={() => onSubmit()}
                    disabled={submitting}
                    className="rounded-none border-2 border-black bg-primary text-white font-black uppercase text-xs italic py-6 px-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all h-auto"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {activeStage.price_usd > 0 ? "INSCRIBIRSE Y REPORTAR PAGO" : "COMPLETAR INSCRIPCIÓN"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
