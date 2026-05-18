import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PaymentReportedOrganizerEmailProps {
  organizerName: string;
  athleteName: string;
  eventName: string;
  amountUsd?: number;
  amountVes?: number;
  referenceNumber: string;
  dashboardUrl: string;
}

export function PaymentReportedOrganizerEmail({
  organizerName,
  athleteName,
  eventName,
  amountUsd,
  amountVes,
  referenceNumber,
  dashboardUrl,
}: PaymentReportedOrganizerEmailProps) {
  const amountDisplay = amountUsd ? `${amountUsd} USD` : amountVes ? `${amountVes} VES` : 'No especificado';

  return (
    <Html>
      <Head />
      <Preview>
        Nuevo pago reportado por {athleteName} para {eventName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Img
              src="https://zonacrono.com/zonacrono_dark.png"
              width="180"
              height="40"
              alt="Zonacrono"
              style={logoImage}
            />
          </Section>

          <Section style={contentSection}>
            <Heading style={heading}>¡Nuevo Pago Reportado!</Heading>

            <Text style={greeting}>Hola {organizerName},</Text>

            <Text style={paragraph}>
              El atleta <strong>{athleteName}</strong> ha reportado un pago para el evento{' '}
              <strong>{eventName}</strong>.
            </Text>

            <Section style={detailsContainer}>
              <Text style={detailText}>
                <strong>Referencia:</strong> {referenceNumber}
              </Text>
              <Text style={detailText}>
                <strong>Monto reportado:</strong> {amountDisplay}
              </Text>
            </Section>

            <Text style={paragraph}>
              Por favor revisa el comprobante y verifica el pago en tu cuenta para proceder con la aprobación de la inscripción.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                Ver Pago en Zonacrono
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Este correo fue enviado automáticamente por Zonacrono al organizador del evento.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// --- Styles ---
const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  border: '2px solid #0a0a0a',
};

const headerSection: React.CSSProperties = {
  backgroundColor: '#0a0a0a',
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const logoImage: React.CSSProperties = {
  margin: '0 auto',
};

const contentSection: React.CSSProperties = {
  padding: '32px',
};

const heading: React.CSSProperties = {
  color: '#0a0a0a',
  fontSize: '24px',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  margin: '0 0 16px',
};

const greeting: React.CSSProperties = {
  fontSize: '16px',
  color: '#333',
  margin: '0 0 12px',
};

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#555',
  margin: '0 0 16px',
};

const detailsContainer: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  padding: '16px',
  margin: '16px 0',
};

const detailText: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  margin: '4px 0',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#d50f17', // brand-red
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 900,
  fontStyle: 'italic',
  textDecoration: 'none',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  padding: '14px 28px',
  border: '2px solid #0a0a0a',
  display: 'inline-block',
};

const hr: React.CSSProperties = {
  borderColor: '#0a0a0a',
  borderWidth: '2px',
  margin: '24px 0',
};

const footer: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '18px',
};
