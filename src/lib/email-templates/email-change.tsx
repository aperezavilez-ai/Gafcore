import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { brand, styles } from './_brand'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirma el cambio de correo en {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brandHeader}>{brand.name}</Text>
        <Section style={styles.card}>
          <Heading style={styles.h1}>Confirma el cambio de correo</Heading>
          <Text style={styles.text}>
            Solicitaste cambiar tu correo en {siteName} de{' '}
            <Link href={`mailto:${oldEmail}`} style={styles.link}>
              {oldEmail}
            </Link>{' '}
            a{' '}
            <Link href={`mailto:${newEmail}`} style={styles.link}>
              {newEmail}
            </Link>
            .
          </Text>
          <Button style={styles.button} href={confirmationUrl}>
            Confirmar cambio
          </Button>
          <Hr style={styles.divider} />
          <Text style={{ ...styles.text, fontSize: '13px', color: brand.muted, margin: 0 }}>
            Si no solicitaste este cambio, asegura tu cuenta de inmediato.
          </Text>
        </Section>
        <Text style={styles.footer}>
          © {new Date().getFullYear()} {brand.name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
