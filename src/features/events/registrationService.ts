import { supabaseAdmin } from '@/lib/supabase';
import { Registration } from './schemas';
import { 
  sendRegistrationReceivedEmail, 
  sendReservationConfirmedEmail, 
  sendPaymentReportedEmail,
  sendPaymentReportedOrganizerEmail,
  sendPaymentRejectedEmail,
  sendRegistrationApprovedEmail 
} from '@/lib/mail';

import { sendTelegramNotification, formatRegistrationAlert } from '@/lib/telegram';

export const registrationService = {
  /**
   * Processes a new registration request
   */
  async processRegistration(data: Registration) {
    if (!supabaseAdmin) {
      throw new Error('Supabase Admin client not configured');
    }

    const {
      event_id,
      stage_id,
      first_name,
      last_name,
      dni,
      email,
      birth_date,
      gender,
      phone,
      blood_type,
      state,
      city,
      club,
      shirt_size,
      payment_data
    } = data;

    // 1. Check for duplicate registration by DNI for this event
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('registrations')
      .select('id, status')
      .eq('event_id', event_id)
      .eq('dni', dni)
      .in('status', ['PENDING', 'REPORTED', 'APPROVED'])
      .maybeSingle();

    if (existing) {
      let message = 'Ya existe una inscripción registrada con esta cédula.';
      if (existing.status === 'PENDING') message = 'Ya tienes una reserva pendiente para este evento. Por favor, completa tu pago.';
      if (existing.status === 'REPORTED') message = 'Tu pago ya ha sido reportado y está siendo verificado.';
      if (existing.status === 'APPROVED') message = 'Ya te encuentras inscrito exitosamente en este evento.';
      throw new Error(message);
    }

    // 2. Calculate Category automatically (Age at End of Year)
    const birthDateObj = new Date(birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();

    const { data: category, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .eq('event_id', event_id)
      .eq('gender', gender)
      .lte('min_age', age)
      .gte('max_age', age)
      .single();

    if (categoryError || !category) {
      throw new Error('No suitable category found for your age and gender.');
    }

    // Set Expiration: Today at 23:59:59
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    // Call Atomic Postgres Function (RPC)
    const { data: registrationId, error: rpcError } = await supabaseAdmin
      .rpc('register_athlete', {
        p_event_id: event_id,
        p_stage_id: stage_id,
        p_category_id: category.id,
        p_first_name: first_name,
        p_last_name: last_name,
        p_dni: dni,
        p_email: email,
        p_birth_date: birth_date,
        p_gender: gender,
        p_phone: phone,
        p_blood_type: blood_type,
        p_state: state,
        p_city: city,
        p_club: club || 'Independiente',
        p_shirt_size: shirt_size,
        p_status: payment_data ? 'REPORTED' : 'PENDING',
        p_expires_at: expiresAt.toISOString(),
        p_payment_data: payment_data || null
      });

    if (rpcError) {
      console.error('Error in register_athlete RPC:', rpcError);
      throw new Error(rpcError.message || 'Failed to process registration');
    }

    // Asynchronous Notifications (Fire and forget)
    console.log(`[RegistrationService] Starting notifications for ${registrationId}...`);
    this.sendNotificationsAfterRegistration(data, registrationId, category.name)
      .then(() => console.log(`[RegistrationService] Notifications for ${registrationId} finished.`))
      .catch(err => console.error(`[RegistrationService] Error in notifications for ${registrationId}:`, err));

    return { registrationId };
  },

  async sendNotificationsAfterRegistration(data: Registration, registrationId: string, categoryName: string) {
    if (!supabaseAdmin) return;

    // 1. Fetch Event Info
    const { data: eventData } = await supabaseAdmin
      .from('events')
      .select('name, slug, manager_id, managers(name, email, telegram_chat_id, telegram_notifications_enabled)')
      .eq('id', data.event_id)
      .single();

    if (!eventData) return;

    // 2. Telegram Notification
    const manager = eventData.managers as any;
    if (manager?.telegram_chat_id && manager?.telegram_notifications_enabled) {
      try {
        const message = formatRegistrationAlert({
          eventName: eventData.name,
          athleteName: `${data.first_name} ${data.last_name}`,
          categoryName: categoryName,
          amount: data.payment_data ? `${data.payment_data.amount_usd} USD` : 'Pendiente'
        });
        await sendTelegramNotification(manager.telegram_chat_id, message);
      } catch (e) {
        console.error('Failed to send Telegram notification:', e);
      }
    }

    // 3. Email Notification
    try {
      const athleteInfo = { email: data.email, firstName: data.first_name, lastName: data.last_name };
      const eventInfo = { name: eventData.name, slug: eventData.slug };

      console.log(`[RegistrationService] Sending email to ${athleteInfo.email} (Payment data: ${!!data.payment_data})`);
      if (data.payment_data) {
        await sendRegistrationReceivedEmail(athleteInfo, eventInfo, registrationId);

        if (manager && manager.email) {
          console.log(`[RegistrationService] Sending organizer email to ${manager.email}`);
          await sendPaymentReportedOrganizerEmail(
            {
              name: manager.name,
              email: manager.email,
            },
            athleteInfo,
            eventInfo,
            {
              amountUsd: data.payment_data.amount_usd,
              amountVes: data.payment_data.amount_ves,
              referenceNumber: data.payment_data.reference_number || 'N/A',
            }
          );
        }
      } else {
        console.log(`[RegistrationService] Calling sendReservationConfirmedEmail for ${registrationId}`);
        await sendReservationConfirmedEmail(athleteInfo, eventInfo, registrationId);
      }
      console.log(`[RegistrationService] Email sent successfully for ${registrationId}`);
    } catch (e) {
      console.error('[RegistrationService] Failed to send Email notification:', e);
    }
  },

  /**
   * Processes a payment report for an existing registration
   */
  async processPaymentReport(registrationId: string, paymentData: {
    referenceNumber: string;
    amountUsd: number;
    amountVes: number;
    exchangeRateBcv: number;
    file: File | null;
  }) {
    if (!supabaseAdmin) {
      throw new Error('Supabase Admin client not configured');
    }

    // 1. Fetch the registration and validate it's PENDING
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('id, status, first_name, last_name, email, event_id, events(name, slug, managers(name, email))')
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      throw new Error('Inscripción no encontrada.');
    }

    if (registration.status !== 'PENDING') {
      throw new Error('Esta inscripción no está pendiente de pago.');
    }

    if (!paymentData.referenceNumber) {
      throw new Error('El número de referencia es requerido.');
    }

    // 2. Upload the receipt if provided
    let receiptUrl = '';
    if (paymentData.file && paymentData.file.size > 0) {
      const extension = paymentData.file.name.split('.').pop() || 'jpg';
      const fileName = `receipts/${registrationId}_${Date.now()}.${extension}`;
      const arrayBuffer = await paymentData.file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin
        .storage
        .from('receipts')
        .upload(fileName, buffer, {
          contentType: paymentData.file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('Receipt upload error:', uploadError);
        throw new Error('Error al subir el comprobante.');
      }

      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from('receipts')
        .getPublicUrl(fileName);

      receiptUrl = publicUrlData.publicUrl;
    }

    // 3. Insert payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        registration_id: registrationId,
        amount_usd: paymentData.amountUsd || 0,
        amount_ves: paymentData.amountVes || 0,
        exchange_rate_bcv: paymentData.exchangeRateBcv || 0,
        reference_number: paymentData.referenceNumber,
        receipt_url: receiptUrl,
        reported_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error('Payment insert error:', paymentError);
      throw new Error('Error al registrar el pago.');
    }

    // 4. Update registration status to REPORTED
    const { error: updateError } = await supabaseAdmin
      .from('registrations')
      .update({ status: 'REPORTED' })
      .eq('id', registrationId);

    if (updateError) {
      console.error('Status update error:', updateError);
      throw new Error('Error al actualizar el estado.');
    }

    // 5. Send email notification (async, non-blocking)
    const event = registration.events as any;
    if (event) {
      sendPaymentReportedEmail(
        {
          email: registration.email,
          firstName: registration.first_name,
          lastName: registration.last_name,
        },
        {
          name: event.name,
          slug: event.slug,
        },
        registrationId
      ).catch((err) => console.error('Email send error:', err));

      if (event.managers && event.managers.email) {
        sendPaymentReportedOrganizerEmail(
          {
            name: event.managers.name,
            email: event.managers.email,
          },
          {
            email: registration.email,
            firstName: registration.first_name,
            lastName: registration.last_name,
          },
          {
            name: event.name,
            slug: event.slug,
          },
          {
            amountUsd: paymentData.amountUsd,
            amountVes: paymentData.amountVes,
            referenceNumber: paymentData.referenceNumber,
          }
        ).catch((err) => console.error('Organizer email send error:', err));
      }
    }

    return true;
  },

  /**
   * Updates registration status and sends appropriate notifications
   */
  async updateRegistrationStatus(registrationId: string, status: string, reason?: string) {
    if (!supabaseAdmin) {
      throw new Error('Supabase Admin client not configured');
    }
    console.log(`[RegistrationService] Updating status of ${registrationId} to ${status}`);
    
    // 1. Update status in database
    const { data: registration, error: updateError } = await supabaseAdmin
      .from('registrations')
      .update({ status })
      .eq('id', registrationId)
      .select('*, events(name, slug)')
      .single();

    if (updateError) {
      console.error('[RegistrationService] Error updating status:', updateError);
      throw updateError;
    }

    // 2. Trigger notifications asynchronously
    this.sendNotificationsOnStatusChange(registration, status, reason).catch(err => {
      console.error('[RegistrationService] Error sending status change notifications:', err);
    });

    return registration;
  },

  async sendNotificationsOnStatusChange(registration: any, status: string, reason?: string) {
    try {
      const athleteInfo = {
        email: registration.email,
        firstName: registration.first_name,
        lastName: registration.last_name
      };
      
      const eventInfo = {
        name: registration.events.name,
        slug: registration.events.slug
      };

      if (status === 'REJECTED') {
        await sendPaymentRejectedEmail(athleteInfo, eventInfo, registration.id, reason);
        console.log(`[RegistrationService] Rejected email sent for ${registration.id}`);
      } else if (status === 'APPROVED') {
        await sendRegistrationApprovedEmail(athleteInfo, eventInfo, registration.id);
        console.log(`[RegistrationService] Approved email sent for ${registration.id}`);
      }
    } catch (e) {
      console.error('[RegistrationService] Failed to send status notification:', e);
    }
  }
};
