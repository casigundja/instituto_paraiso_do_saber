const fs=require('fs');
const source=fs.readFileSync('apps/api/prisma/schema.prisma','utf8');
const names={User:'users',Course:'courses',Event:'events',Campaign:'campaigns',News:'news',Media:'media',Lead:'leads',SiteSetting:'settings',HomeSection:'sections',AuditLog:'audit'};
let migration=`<?php\nuse Illuminate\\Database\\Migrations\\Migration;\nuse Illuminate\\Database\\Schema\\Blueprint;\nuse Illuminate\\Support\\Facades\\Schema;\nreturn new class extends Migration {\n public function up(): void {\n`;
const config={};
for(const m of source.matchAll(/model (\w+) \{([\s\S]*?)\n\}/g)) {
 const entity=names[m[1]], fields={}, defaults={}, required=[];
 migration+=`Schema::create('portal_${entity}', function (Blueprint $table) {\n`;
 for(const line of m[2].trim().split('\n')){
  const f=line.trim().match(/^(\w+)\s+(\w+)(\?)?\s*(.*)$/);if(!f)continue;
  const [,name,type,nullable,attrs]=f;if(!['String','Int','Boolean','DateTime','Role','LeadStatus','PublicationStatus'].includes(type))continue;
  fields[name]=type;
  const def=attrs.match(/@default\(("[^"]*"|\w+)\)/)?.[1];
  if(def)defaults[name]=def.startsWith('"')?JSON.parse(def):def==='true'?true:def==='false'?false:/^\d+$/.test(def)?Number(def):def;
  if(!nullable&&!def&&!['id','createdAt','updatedAt'].includes(name))required.push(name);
  const method=type==='Int'?'integer':type==='Boolean'?'boolean':type==='DateTime'?'dateTime':attrs.includes('@db.Text')?'text':'string';
  let declaration=`$table->${method}('${name}')`;
  if(attrs.includes('@id'))declaration+='->primary()';else if(attrs.includes('@unique'))declaration+='->unique()';
  if(nullable)declaration+='->nullable()';
  if(def)declaration+='->default('+JSON.stringify(defaults[name]).replace(/^"(.*)"$/,"'$1'")+')';
  if(['createdAt','updatedAt'].includes(name))declaration+='->useCurrent()';
  migration+=declaration+';\n';
 }
 migration+='});\n';config[entity]={fields,defaults,required};
}
migration+=`Schema::create('portal_tokens',function(Blueprint $table){$table->string('hash',64)->primary();$table->string('userId')->index();$table->dateTime('expiresAt');});\n}\npublic function down(): void {\n`;
for(const n of ['tokens',...Object.values(names).reverse()])migration+=`Schema::dropIfExists('portal_${n}');\n`;
migration+='}\n};\n';
fs.writeFileSync('database/migrations/2026_09_23_000000_create_portal_tables.php',migration);
fs.writeFileSync('config/portal-schema.json',JSON.stringify(config,null,2));
