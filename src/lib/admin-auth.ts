/**
 * Admin authentication — DB-backed, role-aware session auth.
 * Production uses the AdminUser/AdminSession tables in Supabase PostgreSQL.
 */
import bcrypt from 'bcryptjs';
import { db } from './db';
import { env } from './env';

export type AdminRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
export interface AdminSession { token:string; email:string; name:string; role:AdminRole; userId:string; expiresAt:number; }

const SESSION_TTL_MS = env.ADMIN_SESSION_TTL_MS;
const DRIVER: 'db' | 'memory' = (process.env.ADMIN_SESSION_DRIVER as 'db'|'memory'|undefined) ?? (env.isProduction ? 'db' : 'memory');
const sessions = new Map<string, AdminSession>();

function pruneExpiredMemory(){ const now=Date.now(); for(const [token,s] of sessions) if(s.expiresAt<=now) sessions.delete(token); }
async function pruneExpiredDb(){ try{ await db.adminSession.deleteMany({where:{expiresAt:{lt:new Date()}}}); }catch{} }

export async function createAdminSession(user:{id:string;email:string;name:string;role:string}):Promise<string>{
  const token=crypto.randomUUID(); const expiresAt=Date.now()+SESSION_TTL_MS;
  if(DRIVER==='db') await db.adminSession.create({data:{token,userId:user.id,email:user.email,name:user.name,role:user.role,expiresAt:new Date(expiresAt)}});
  else { pruneExpiredMemory(); sessions.set(token,{token,email:user.email,name:user.name,role:user.role as AdminRole,userId:user.id,expiresAt}); }
  return token;
}

export async function revokeAdminSession(token:string):Promise<void>{
  if(DRIVER==='db'){ try{await db.adminSession.updateMany({where:{token},data:{revokedAt:new Date()}});}catch{} }
  else sessions.delete(token);
}

export async function verifyAdminAuth(request:Request):Promise<AdminSession|null>{
  const cookieHeader=request.headers.get('cookie')??''; const match=cookieHeader.match(/(?:^|;\s*)admin-session=([^;]*)/); if(!match)return null;
  const token=match[1];
  if(DRIVER==='db'){
    await pruneExpiredDb(); const row=await db.adminSession.findUnique({where:{token}}); if(!row||row.revokedAt||row.expiresAt.getTime()<=Date.now()) return null;
    return {token:row.token,email:row.email,name:row.name,role:row.role as AdminRole,userId:row.userId,expiresAt:row.expiresAt.getTime()};
  }
  pruneExpiredMemory(); const s=sessions.get(token); if(!s||s.expiresAt<=Date.now()){if(s)sessions.delete(token);return null;} return s;
}

export function verifyAdminAuthSync(request:Request):AdminSession|null{
  if(DRIVER!=='memory') throw new Error('[admin-auth] Sync verifier cannot be used with the DB driver. Use await verifyAdminAuth(request).');
  const match=(request.headers.get('cookie')??'').match(/(?:^|;\s*)admin-session=([^;]*)/); if(!match)return null;
  pruneExpiredMemory(); const s=sessions.get(match[1]); if(!s||s.expiresAt<=Date.now()){if(s)sessions.delete(match[1]);return null;} return s;
}

/**
 * Authenticate against Supabase/PostgreSQL. If the DB has no admin yet,
 * a one-time bootstrap is allowed only when BOTH ADMIN_EMAIL and
 * ADMIN_BOOTSTRAP_PASSWORD are configured server-side. No default password
 * is used and the password is stored only as a bcrypt hash.
 */
export async function authenticateAdmin(email:string,password:string):Promise<{token:string;user:{id:string;email:string;name:string;role:AdminRole}}|null>{
  if(!email||!password)return null;
  const normalized=email.toLowerCase().trim();
  let user=await db.adminUser.findUnique({where:{email:normalized},select:{id:true,email:true,name:true,role:true,passwordHash:true,active:true}});

  if(!user){
    const bootstrapEmail=process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const bootstrapPassword=process.env.ADMIN_BOOTSTRAP_PASSWORD;
    const bootstrapName=process.env.ADMIN_NAME?.trim() || 'ASAS Admin';
    if(bootstrapEmail===normalized && bootstrapPassword && bootstrapPassword.length>=16 && password===bootstrapPassword){
      const passwordHash=await bcrypt.hash(bootstrapPassword,12);
      user=await db.adminUser.upsert({where:{email:normalized},create:{email:normalized,name:bootstrapName,passwordHash,role:'ADMIN',active:true},update:{name:bootstrapName,passwordHash,role:'ADMIN',active:true},select:{id:true,email:true,name:true,role:true,passwordHash:true,active:true}});
    }
  }

  if(!user||!user.active||!['ADMIN','EDITOR','VIEWER'].includes(user.role))return null;
  let ok=false; try{ok=await bcrypt.compare(password,user.passwordHash);}catch(err){console.error('[admin-auth] password verify error:',err);return null;}
  if(!ok)return null;
  const token=await createAdminSession({id:user.id,email:user.email,name:user.name,role:user.role});
  return {token,user:{id:user.id,email:user.email,name:user.name,role:user.role as AdminRole}};
}

export function sessionHasRole(session:AdminSession|null,allowed:AdminRole[]):boolean{return !!session&&allowed.includes(session.role);}
