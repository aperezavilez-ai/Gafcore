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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu enlace de acceso a {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brandHeader}>{brand.name}</Text>
        <Section style={styles.card}>
          <Heading style={styles.h1}>Tu enlace de acceso</Heading>
          <Text style={styles.text}>
            Haz clic en el botón para iniciar sesión en {siteName}. Este enlace expira pronto.
          </Text>
          <Button style={styles.button} href={confirmationUrl}>
            Iniciar sesión
          </Button>
          <Hr style={styles.divider} />
          <Text style={{ ...styles.text, fontSize: '13px', color: brand.muted, margin: 0 }}>
            Si no solicitaste este enlace, puedes ignorar este correo.
          </Text>
        </Section>
        <Text style={styles.footer}>
          © {new Date().getFullYear()} {brand.name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
