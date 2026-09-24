import type { Metadata } from 'next';
import './site.css';
export const metadata:Metadata={title:'Instituto Paraíso do Saber | Formação que transforma',description:'Formação profissional na área da saúde. Conheça os cursos e faça a sua inscrição no Instituto Técnico Privado de Saúde Paraíso do Saber.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-AO"><body>{children}</body></html>}
