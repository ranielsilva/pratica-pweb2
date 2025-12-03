import multer from 'multer';

// Configuração do Multer para armazenamento em memória
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Filtro para aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  },
});

export default upload;