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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirma tu correo en {brand.name}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brandHeader}>{brand.name}</Text>
        <Section style={styles.card}>
          <Heading style={styles.h1}>Confirma tu correo</Heading>
          <Text style={styles.text}>
            ¡Gracias por registrarte en{' '}
            <Link href={siteUrl} style={styles.link}>
              <strong>{siteName}</strong>
            </Link>
            !
          </Text>
          <Text style={styles.text}>
            Confirma tu dirección ({recipient}) haciendo clic en el botón:
          </Text>
          <Button style={styles.button} href={confirmationUrl}>
            Verificar correo
          </Button>
          <Hr style={styles.divider} />
          <Text style={{ ...styles.text, fontSize: '13px', color: brand.muted, margin: 0 }}>
            Si no creaste esta cuenta, puedes ignorar este correo.
          </Text>
        </Section>
        <Text style={styles.footer}>
          © {new Date().getFullYear()} {brand.name} · Crea, distribuye y viraliza tu música
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
