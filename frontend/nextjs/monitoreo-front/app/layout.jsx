import { estaSesion } from '@/hooks/SessionUtil';
import 'bootstrap/dist/css/bootstrap.css';

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }) {
  const autenticado = estaSesion();

  return (
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ backgroundImage: 'url("https://img.freepik.com/fotos-premium/paisaje-oscuro-montanas-rio-primer-plano_677426-165.jpg")', backgroundSize: 'cover' }} className="bg-primary text-white">
        <section className="container-fluid flex-grow-1">
          {children}
        </section>
      </body>
    </html>
  );
}