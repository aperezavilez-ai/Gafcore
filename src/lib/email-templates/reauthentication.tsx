import * as React from 'react'
import {
  Body,
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

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu código de verificación</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brandHeader}>{brand.name}</Text>
        <Section style={styles.card}>
          <Heading style={styles.h1}>Confirma tu identidad</Heading>
          <Text style={styles.text}>Usa el siguiente código para confirmar tu identidad:</Text>
          <Text style={styles.code}>{token}</Text>
          <Hr style={styles.divider} />
          <Text style={{ ...styles.text, fontSize: '13px', color: brand.muted, margin: 0 }}>
            Este código expira pronto. Si no solicitaste esto, puedes ignorar el correo.
          </Text>
        </Section>
        <Text style={styles.footer}>
          © {new Date().getFullYear()} {brand.name}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
