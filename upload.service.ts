import { fileTypeFromBuffer } from 'file-type';
import { prisma } from '../lib/prisma';
import supabase from '../../../supabase.js'; // Ajuste o caminho se o arquivo supabase.js estiver em outro lugar

const BUCKET_NAME = 'avatars';

/**
 * Faz o upload de um avatar de usuário para o Supabase Storage e atualiza o usuário no banco de dados.
 * @param userId - O ID do usuário.
 * @param fileBuffer - O buffer do arquivo da imagem.
 * @param originalName - O nome original do arquivo.
 */
export async function uploadAvatarAndUpdateUser(userId: number, fileBuffer: Buffer, originalName: string) {
  // 1. Detecta o tipo de arquivo e a extensão de forma segura a partir do buffer
  const fileType = await fileTypeFromBuffer(fileBuffer);
  if (!fileType || !['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)) {
    throw new Error('Tipo de arquivo inválido. Apenas JPEG, PNG e WebP são permitidos.');
  }

  // 2. Cria um nome de arquivo único para evitar conflitos
  const fileExtension = fileType.ext;
  const fileName = `user-${userId}-${Date.now()}.${fileExtension}`;
  const filePath = `${userId}/${fileName}`;

  // 3. Faz o upload do arquivo para o Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType: fileType.mime,
      upsert: true, // Sobrescreve se já existir um arquivo com o mesmo nome
    });

  if (uploadError) {
    throw new Error(`Erro no upload para o Supabase: ${uploadError.message}`);
  }

  // 4. Obtém a URL pública do arquivo recém-enviado
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  // 5. Atualiza o campo avatarUrl do usuário no banco de dados
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: urlData.publicUrl },
    select: { id: true, email: true, avatarUrl: true }, // Retorna apenas dados seguros
  });

  return updatedUser;
}