import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { brand, styles } from './_brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Restablece tu contraseña en {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brandHeader}>{brand.name}</Text>
        <Section style={styles.card}>
          <Heading style={styles.h1}>Restablece tu contraseña</Heading>
          <Text style={styles.text}>
            Recibimos una solicitud para restablecer tu contraseña en {siteName}. Haz clic en el botón para crear una nueva.
          </Text>
          <Button style={styles.button} href={confirmationUrl}>
            Restablecer contraseña
          </Button>
          <Hr style={styles.divider} />
          <Text style={{ ...styles.text, fontSize: '13px', color: brand.muted, margin: 0 }}>
            Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no cambiará.
          </Text>
        </Section>
        <Text style={styles.footer}>
          © {new Date().getFullYear()} {brand.name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
