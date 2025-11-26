import { processDriveFolder } from '@/lib/sync/process-drive-folder';
import client from '@/lib/db/client';

export async function GET() {
  try {
    await client.connect();
    await processDriveFolder();
    return Response.json({ success: true, message: 'Sincronização concluída com sucesso!' });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização' 
    }, { status: 500 });
  } finally {
    await client.close();
  }
}