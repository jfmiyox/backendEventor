import multer from 'multer'


const storage= multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const permitirTypes= ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (permitirTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'), false);
  }
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 
  }
});

export default upload;