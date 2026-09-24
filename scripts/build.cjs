const esbuild=require('esbuild');
const options={entryPoints:['resources/js/app.tsx'],bundle:true,minify:true,jsx:'automatic',outfile:'public/build/app.js',define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'};
if(process.argv.includes('--watch')) esbuild.context(options).then(ctx=>ctx.watch());
else esbuild.build(options).catch(()=>process.exit(1));
