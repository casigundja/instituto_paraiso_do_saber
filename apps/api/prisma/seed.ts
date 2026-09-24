import { PrismaClient } from '../generated/client';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
 const email=process.env.ADMIN_EMAIL||'admin@paraisodosaber.ao';
 const password=process.env.ADMIN_PASSWORD||'ChangeMe-2026!';
 await prisma.user.upsert({where:{email},update:{},create:{email,name:'Administrador',passwordHash:await hash(password,12),role:'ADMIN'}});
 const courses:[string,string,string,string][]=[['farmacia','Farmácia','Formação profissional para promover o uso seguro e responsável dos medicamentos.','/banner1.jpeg'],['fisioterapia','Fisioterapia','Formação para apoiar a reabilitação, o movimento e a qualidade de vida.','/banner2.jpeg'],['estomatologia','Estomatologia / Medicina Dentária','Prepare-se para cuidar da saúde oral com competência e responsabilidade.','/banner3.jpeg']];
 for (const [slug,name,description,image] of courses) await prisma.course.upsert({where:{slug},update:{},create:{slug,name,description,image,area:'Saúde',featured:true}});
 for (const [key,value] of Object.entries({institutionName:'Instituto Técnico Privado de Saúde Paraíso do Saber',phone1:'+244 930 133 850',phone2:'+244 953 955 368',whatsapp:'244930133850',address:'Bairro Paraíso, depois da Pracinha Nova, em frente à Casa do Partido do MPLA.',logo:'/logo_paraiso_do_saber.jpeg'})) await prisma.siteSetting.upsert({where:{key},update:{},create:{key,value}});
 const sections:[string,string,number][]=[['hero','O seu futuro começa aqui.',0],['enrollment','Inscrições e matrículas abertas',1],['courses','Cursos em destaque',2],['about','Conheça o Paraíso do Saber',3],['video','Conheça o Instituto',4],['events','Próximos eventos',5],['news','Notícias do Instituto',6],['gallery','Galeria do Instituto',7]];
 for (const [key,title,order] of sections) await prisma.homeSection.upsert({where:{key},update:{},create:{key,title,order}});
}
main().finally(()=>prisma.$disconnect());
